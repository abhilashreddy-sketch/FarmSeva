import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NotificationType, NotificationPriority } from '@farm-seva/shared';
import { ApiError } from '../middleware/error-middleware';
import { logAuditEvent } from '../utils/audit-logger';
import { notificationService } from './notification-service';

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

      let currentPrice = Number(item.product.sellingPrice);
      if (item.variant) {
        currentPrice = Number(item.variant.sellingPrice);
      } else if (item.listing) {
        currentPrice = Number(item.listing.sellingPrice);
      }

      const cartPrice = Number(item.priceAtAddition);
      if (Math.abs(currentPrice - cartPrice) > 0.01) {
        throw new ApiError('PRICE_CHANGED', 'Price for product ' + item.product.name + ' has changed. Please review your cart.', 400);
      }

      if (item.variant) {
        if (item.variant.stockQuantity < item.quantity) {
          throw new ApiError('INVENTORY_UNAVAILABLE', 'Insufficient stock for product ' + item.product.name, 400);
        }
      } else if (item.listing) {
        if (item.listing.quantityAvailable < item.quantity) {
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

    // Pre-generate OTP and bcrypt hash OUTSIDE database transaction
    const shopOtpMap = new Map<string, { rawOtp: string; hash: string }>();
    for (const shopId of itemsByShop.keys()) {
      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const hash = await bcrypt.hash(rawOtp, 8);
      shopOtpMap.set(shopId, { rawOtp, hash });
    }

    const createdOrders: any[] = [];

    // Execute atomic transaction with 15s timeout
    await prisma.$transaction(
      async (tx) => {
        for (const [shopId, shopItems] of itemsByShop.entries()) {
          let shopTotal = 0;
          const orderItemDataList: any[] = [];

          for (const item of shopItems) {
            const unitPrice = item.variant
              ? Number(item.variant.sellingPrice)
              : item.listing
              ? Number(item.listing.sellingPrice)
              : Number(item.product.sellingPrice);
            const totalPrice = unitPrice * item.quantity;
            shopTotal += totalPrice;

            if (item.variantId) {
              const updatedCount = await tx.productVariant.updateMany({
                where: {
                  id: item.variantId,
                  stockQuantity: { gte: item.quantity },
                },
                data: { stockQuantity: { decrement: item.quantity } },
              });

              if (updatedCount.count === 0) {
                throw new ApiError('INSUFFICIENT_STOCK', `Product ${item.product.name} is out of stock`, 400);
              }
            } else if (item.sellerListingId) {
              const updatedCount = await tx.sellerListing.updateMany({
                where: {
                  id: item.sellerListingId,
                  quantityAvailable: { gte: item.quantity },
                },
                data: { quantityAvailable: { decrement: item.quantity } },
              });

              if (updatedCount.count === 0) {
                throw new ApiError('INSUFFICIENT_STOCK', `Product ${item.product.name} is out of stock`, 400);
              }
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

          await tx.payment.create({
            data: {
              orderId: order.id,
              paymentProvider: params.paymentMethod === 'COD' ? 'CASH_ON_DELIVERY' : 'RAZORPAY',
              paymentMethod: params.paymentMethod,
              status: 'PENDING',
              amount: netAmount,
            },
          });

          const otpInfo = shopOtpMap.get(shopId)!;
          const trackingCode = 'FS-TRK-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000);

          await tx.delivery.create({
            data: {
              orderId: order.id,
              status: 'UNASSIGNED',
              trackingCode,
              deliveryOtpHash: otpInfo.hash,
            },
          });

          (order as any).rawDeliveryOtp = otpInfo.rawOtp;
          createdOrders.push(order);

          // Calculate server-side commission and double-entry ledger records
          const { CommissionService } = await import('./financial/commission-service');
          await CommissionService.calculateAndRecordOrderCommission(order.id, tx);
        }

        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        await logAuditEvent({
          userId,
          action: 'ORDER_CHECKOUT_COMPLETED',
          entityName: 'Order',
          entityId: createdOrders[0]?.id || 'MULTI',
          changesJson: { orderCount: createdOrders.length, paymentMethod: params.paymentMethod },
        });
      },
      { timeout: 15000 }
    );

    // Trigger multi-channel order notification after transaction completion
    for (const order of createdOrders) {
      notificationService
        .dispatchNotification({
          userId,
          type: NotificationType.ORDER_UPDATE,
          title: 'Order Placed Successfully',
          message: `Your order #${order.orderNumber} for ₹${order.netAmount} from ${order.shop?.shopName || 'Seller'} has been received.`,
          priority: NotificationPriority.HIGH,
          metadata: { orderId: order.id, orderNumber: order.orderNumber },
        })
        .catch(err => console.error('[CheckoutService] Error dispatching order notification:', err));
    }

    return {
      success: true,
      orders: createdOrders,
      message: 'Order placed successfully',
    };
  }
}
