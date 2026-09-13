import { PrismaClient } from '@prisma/client';
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
      changesJson: { from: order.status, to: targetStatus },
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
