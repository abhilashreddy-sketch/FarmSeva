import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NotificationType, NotificationPriority } from '@farm-seva/shared';
import { ApiError } from '../middleware/error-middleware';
import { logAuditEvent } from '../utils/audit-logger';
import { notificationService } from './notification-service';

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
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: { include: { farmer: true } } },
    });
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

    if (delivery.order.farmer.userId) {
      notificationService
        .dispatchNotification({
          userId: delivery.order.farmer.userId,
          type: NotificationType.DELIVERY_UPDATE,
          title: 'Delivery Partner Assigned',
          message: `Delivery partner has been assigned to your order #${delivery.order.orderNumber}.`,
          priority: NotificationPriority.MEDIUM,
          metadata: { deliveryId, orderId: delivery.orderId },
        })
        .catch(err => console.error('[DeliveryService] Error sending delivery notification:', err));
    }

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
      include: { order: { include: { farmer: true } } },
    });

    if (!delivery) {
      throw new ApiError('DELIVERY_NOT_FOUND', 'Delivery record not found', 404);
    }

    if (userRole !== 'ADMIN' && delivery.deliveryPartnerId !== partner?.id) {
      throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Delivery is not assigned to you', 403);
    }

    if (delivery.status === 'DELIVERED') {
      throw new ApiError('INVALID_DELIVERY_STATE', 'Delivery is already completed', 400);
    }

    // Handled OTP Verification during final drop-off
    if (targetStatus === 'DELIVERED') {
      if (userRole !== 'ADMIN') {
        if (!deliveryOtp) {
          throw new ApiError('DELIVERY_OTP_REQUIRED', 'Delivery OTP is required for completion', 400);
        }

        if (!delivery.deliveryOtpHash) {
          throw new ApiError('DELIVERY_OTP_MISSING', 'No delivery OTP configured for this order or OTP has expired', 400);
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
    if (targetStatus === 'DELIVERED') {
      updateData.deliveredAt = now;
      updateData.deliveryOtpHash = null; // Clear OTP hash to prevent replay attacks
    }

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

    if (delivery.order.farmer.userId) {
      notificationService
        .dispatchNotification({
          userId: delivery.order.farmer.userId,
          type: NotificationType.DELIVERY_UPDATE,
          title: `Delivery Status: ${targetStatus}`,
          message: `Your order #${delivery.order.orderNumber} status is now ${targetStatus}.`,
          priority: targetStatus === 'DELIVERED' ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
          metadata: { deliveryId, orderId: delivery.orderId, status: targetStatus },
        })
        .catch(err => console.error('[DeliveryService] Error sending delivery update notification:', err));
    }

    return updated;
  }
}

