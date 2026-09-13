const fs = require('fs');
const path = require('path');

const checkoutSvc = `import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ApiError } from '../middleware/error-middleware';
import { logAuditEvent } from '../utils/audit-logger';

const prisma = new PrismaClient();

export class CheckoutService {
  static async processCheckout(
    userId: string,
    params: {
      addressId: string;
      paymentMethod: 'COD' | 'ONLINE';
      idempotencyKey?: string;
      assistedByAgentId?: string;
    }
  ) {
    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!farmer) {
      throw new ApiError('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found', 404);
    }

    if (farmer.user.status !== 'ACTIVE') {
      throw new ApiError('ACCOUNT_SUSPENDED', 'Farmer account is not active', 403);
    }

    // Validate delivery address ownership
    const address = await prisma.address.findUnique({ where: { id: params.addressId } });
    if (!address) {
      throw new ApiError('ADDRESS_NOT_FOUND', 'Delivery address not found', 404);
    }
    if (address.userId !== userId) {
      throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Address does not belong to farmer', 403);
    }

    // Fetch farmer cart
    const cart = await prisma.cart.findUnique({
      where: { farmerId: farmer.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: { include: { shops: true } },
                compliance: true,
              },
            },
            variant: true,
            listing: { include: { shop: true } },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new ApiError('CART_EMPTY', 'Your shopping cart is empty', 400);
    }

    // Validate items, prices, seller status, and inventory
    for (const item of cart.items) {
      if (item.product.status !== 'APPROVED') {
        throw new ApiError('PRODUCT_UNAVAILABLE', 'Product ' + item.product.name + ' is no longer available', 400);
      }

      if (item.product.seller.verificationStatus !== 'APPROVED') {
        throw new ApiError('SELLER_NOT_VERIFIED', 'Seller for product ' + item.product.name + ' is not authorized', 400);
      }

      // Check current price vs cart price
      let currentPrice = Number(item.product.sellingPrice);
      if (item.variant) {
        currentPrice = Number(item.variant.sellingPrice);
      }
      const cartPrice = Number(item.priceAtAddition);
      if (Math.abs(currentPrice - cartPrice) > 0.01) {
        throw new ApiError('PRICE_CHANGED', 'Price for product ' + item.product.name + ' has changed. Please review your cart.', 400);
      }

      // Check stock availability
      if (item.variant) {
        if (item.variant.stockQuantity < item.quantity) {
          throw new ApiError('INVENTORY_UNAVAILABLE', 'Insufficient stock for product ' + item.product.name, 400);
        }
      }
    }

    // Group cart items by Shop ID for multi-seller cart support
    const itemsByShop = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      let shopId = item.listing?.shopId;
      if (!shopId) {
        shopId = item.product.seller.shops[0]?.id;
      }
      if (!shopId) {
        throw new ApiError('SHOP_NOT_FOUND', 'No active retail shop found for product ' + item.product.name, 400);
      }

      if (!itemsByShop.has(shopId)) {
        itemsByShop.set(shopId, []);
      }
      itemsByShop.get(shopId)!.push(item);
    }

    const createdOrders: any[] = [];

    // Execute atomic transaction for order creation, inventory reservation, and cart cleanup
    await prisma.$transaction(async (tx) => {
      for (const [shopId, shopItems] of itemsByShop.entries()) {
        let shopTotal = 0;
        const orderItemDataList: any[] = [];

        for (const item of shopItems) {
          const unitPrice = item.variant ? Number(item.variant.sellingPrice) : Number(item.product.sellingPrice);
          const totalPrice = unitPrice * item.quantity;
          shopTotal += totalPrice;

          // Reserve inventory
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQuantity: { decrement: item.quantity } },
            });
          }

          orderItemDataList.push({
            productId: item.productId,
            productName: item.product.name,
            packSize: item.variant ? item.variant.packSize : item.product.packSize,
            packUnit: item.variant ? item.variant.packUnit : item.product.packUnit,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
          });
        }

        const deliveryFee = 0.00;
        const taxAmount = 0.00;
        const netAmount = shopTotal + deliveryFee + taxAmount;
        const orderNumber = 'FS-ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);

        // Create Order
        const order = await tx.order.create({
          data: {
            orderNumber,
            farmerId: farmer.id,
            shopId,
            assistedByAgentId: params.assistedByAgentId || null,
            shippingAddressId: address.id,
            status: 'PENDING_ACCEPTANCE',
            paymentStatus: params.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
            totalItemsPrice: shopTotal,
            deliveryFee,
            taxAmount,
            netAmount,
            items: {
              create: orderItemDataList,
            },
          },
          include: {
            items: true,
            shop: true,
          },
        });

        // Create Payment record
        await tx.payment.create({
          data: {
            orderId: order.id,
            paymentProvider: params.paymentMethod === 'COD' ? 'CASH_ON_DELIVERY' : 'RAZORPAY',
            paymentMethod: params.paymentMethod,
            status: 'PENDING',
            amount: netAmount,
          },
        });

        // Generate 6-digit Delivery OTP and store hash
        const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const deliveryOtpHash = await bcrypt.hash(rawOtp, 10);
        const trackingCode = 'FS-TRK-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000);

        await tx.delivery.create({
          data: {
            orderId: order.id,
            status: 'UNASSIGNED',
            trackingCode,
            deliveryOtpHash,
          },
        });

        // Attach unhashed OTP to response for test/farmer view
        (order as any).rawDeliveryOtp = rawOtp;
        createdOrders.push(order);
      }

      // Clear ordered items from farmer cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      await logAuditEvent({
        userId,
        action: 'ORDER_CHECKOUT_COMPLETED',
        entityName: 'Order',
        entityId: createdOrders[0]?.id || 'MULTI',
        changesJson: JSON.stringify({ orderCount: createdOrders.length, paymentMethod: params.paymentMethod }),
      });
    });

    return {
      success: true,
      orders: createdOrders,
      message: 'Order placed successfully',
    };
  }
}
`;

const orderSvc = `import { PrismaClient } from '@prisma/client';
import { validateOrderStateTransition } from '@farm-seva/shared';
import { ApiError } from '../middleware/error-middleware';
import { logAuditEvent } from '../utils/audit-logger';

const prisma = new PrismaClient();

export class OrderService {
  static async getFarmerOrders(userId: string) {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) {
      throw new ApiError('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found', 404);
    }

    const orders = await prisma.order.findMany({
      where: { farmerId: farmer.id },
      include: {
        shop: { select: { id: true, shopName: true, district: true } },
        items: { include: { product: { select: { name: true, brand: true, images: { where: { isPrimary: true } } } } } },
        delivery: { select: { status: true, trackingCode: true, deliveryPartner: { select: { vehicleType: true } } } },
        payments: { select: { status: true, paymentMethod: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  static async getFarmerOrderById(userId: string, orderId: string) {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) {
      throw new ApiError('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found', 404);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shop: true,
        shippingAddress: true,
        items: { include: { product: { include: { compliance: true } } } },
        delivery: true,
        payments: true,
        invoice: true,
      },
    });

    if (!order) {
      throw new ApiError('ORDER_NOT_FOUND', 'Order not found', 404);
    }

    if (order.farmerId !== farmer.id) {
      throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Access to this order is denied', 403);
    }

    return order;
  }

  static async getSellerOrders(userId: string) {
    const seller = await prisma.seller.findUnique({
      where: { userId },
      include: { shops: true },
    });

    if (!seller) {
      throw new ApiError('SELLER_NOT_FOUND', 'Seller profile not found', 404);
    }

    const shopIds = seller.shops.map((s) => s.id);

    const orders = await prisma.order.findMany({
      where: { shopId: { in: shopIds } },
      include: {
        shippingAddress: { select: { recipientName: true, phone: true, villageTaluk: true, district: true } },
        items: true,
        delivery: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  static async getSellerOrderById(userId: string, orderId: string) {
    const seller = await prisma.seller.findUnique({
      where: { userId },
      include: { shops: true },
    });

    if (!seller) {
      throw new ApiError('SELLER_NOT_FOUND', 'Seller profile not found', 404);
    }

    const shopIds = seller.shops.map((s) => s.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shippingAddress: true,
        items: true,
        delivery: true,
        payments: true,
      },
    });

    if (!order) {
      throw new ApiError('ORDER_NOT_FOUND', 'Order not found', 404);
    }

    if (!shopIds.includes(order.shopId)) {
      throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Order does not belong to seller shop', 403);
    }

    return order;
  }

  static async updateOrderStatus(
    userId: string,
    userRole: any,
    orderId: string,
    targetStatus: any,
    reasons?: { cancellationReason?: string; rejectionReason?: string }
  ) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new ApiError('ORDER_NOT_FOUND', 'Order not found', 404);
    }

    // Validate state transition using shared state machine
    const transitionCheck = validateOrderStateTransition(order.status as any, targetStatus, userRole);
    if (!transitionCheck.isValid) {
      throw new ApiError('INVALID_ORDER_STATE', transitionCheck.error || 'Invalid order state transition', 400);
    }

    // If order is cancelled, release inventory back
    if (targetStatus === 'CANCELLED' || targetStatus === 'REJECTED') {
      const orderItems = await prisma.orderItem.findMany({ where: { orderId } });
      for (const item of orderItems) {
        const variant = await prisma.productVariant.findFirst({
          where: { productId: item.productId, packSize: item.packSize },
        });
        if (variant) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
      }
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: targetStatus,
        ...(reasons?.cancellationReason && { cancellationReason: reasons.cancellationReason }),
        ...(reasons?.rejectionReason && { rejectionReason: reasons.rejectionReason }),
      },
    });

    await logAuditEvent({
      userId,
      action: 'ORDER_STATUS_UPDATED',
      entityName: 'Order',
      entityId: orderId,
      changesJson: JSON.stringify({ from: order.status, to: targetStatus }),
    });

    return updated;
  }

  static async getAdminOrders() {
    const orders = await prisma.order.findMany({
      include: {
        farmer: { include: { user: { select: { fullName: true, phone: true } } } },
        shop: { select: { shopName: true, district: true } },
        items: true,
        delivery: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders;
  }
}
`;

const deliverySvc = `import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ApiError } from '../middleware/error-middleware';
import { logAuditEvent } from '../utils/audit-logger';

const prisma = new PrismaClient();

export class DeliveryService {
  static async getAssignedDeliveries(userId: string) {
    const partner = await prisma.deliveryPartner.findUnique({ where: { userId } });
    if (!partner) {
      throw new ApiError('DELIVERY_PARTNER_NOT_FOUND', 'Delivery partner profile not found', 404);
    }

    const deliveries = await prisma.delivery.findMany({
      where: { deliveryPartnerId: partner.id },
      include: {
        order: {
          include: {
            shippingAddress: true,
            shop: { select: { shopName: true, contactPhone: true, addressLine: true } },
            items: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return deliveries;
  }

  static async assignDeliveryPartner(adminUserId: string, deliveryId: string, deliveryPartnerId: string) {
    const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (!delivery) {
      throw new ApiError('DELIVERY_NOT_FOUND', 'Delivery record not found', 404);
    }

    const partner = await prisma.deliveryPartner.findUnique({ where: { id: deliveryPartnerId } });
    if (!partner) {
      throw new ApiError('DELIVERY_PARTNER_NOT_FOUND', 'Delivery partner not found', 404);
    }

    const updated = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        deliveryPartnerId,
        status: 'ASSIGNED',
        assignedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: adminUserId,
      action: 'DELIVERY_PARTNER_ASSIGNED',
      entityName: 'Delivery',
      entityId: deliveryId,
      changesJson: JSON.stringify({ deliveryPartnerId }),
    });

    return updated;
  }

  static async updateDeliveryStatus(
    userId: string,
    userRole: string,
    deliveryId: string,
    targetStatus: string,
    deliveryOtp?: string,
    notes?: string
  ) {
    const partner = await prisma.deliveryPartner.findUnique({ where: { userId } });
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });

    if (!delivery) {
      throw new ApiError('DELIVERY_NOT_FOUND', 'Delivery record not found', 404);
    }

    if (userRole !== 'ADMIN' && delivery.deliveryPartnerId !== partner?.id) {
      throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Delivery is not assigned to you', 403);
    }

    // Handled OTP Verification during final drop-off
    if (targetStatus === 'DELIVERED') {
      if (userRole !== 'ADMIN') {
        if (!deliveryOtp) {
          throw new ApiError('DELIVERY_OTP_REQUIRED', 'Delivery OTP is required for completion', 400);
        }

        if (!delivery.deliveryOtpHash) {
          throw new ApiError('DELIVERY_OTP_MISSING', 'No delivery OTP configured for this order', 400);
        }

        const isOtpMatch = await bcrypt.compare(deliveryOtp, delivery.deliveryOtpHash);
        if (!isOtpMatch) {
          throw new ApiError('INVALID_DELIVERY_OTP', 'Invalid delivery OTP entered', 400);
        }
      }
    }

    const now = new Date();
    const updateData: any = {
      status: targetStatus,
      notes: notes || delivery.notes,
    };

    if (targetStatus === 'PICKED_UP') updateData.pickedUpAt = now;
    if (targetStatus === 'DELIVERED') updateData.deliveredAt = now;

    const updated = await prisma.delivery.update({
      where: { id: deliveryId },
      data: updateData,
    });

    // If delivered, automatically update order status to DELIVERED
    if (targetStatus === 'DELIVERED') {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: {
          status: 'DELIVERED',
          ...(delivery.order.paymentStatus === 'PENDING' && { paymentStatus: 'COMPLETED' }),
        },
      });
    }

    await logAuditEvent({
      userId,
      action: 'DELIVERY_STATUS_UPDATED',
      entityName: 'Delivery',
      entityId: deliveryId,
      changesJson: JSON.stringify({ status: targetStatus }),
    });

    return updated;
  }
}
`;

fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'services', 'checkout-service.ts'), checkoutSvc, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'services', 'order-service.ts'), orderSvc, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'services', 'delivery-service.ts'), deliverySvc, 'utf8');
console.log('Created checkout-service.ts, order-service.ts, delivery-service.ts.');
