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

  static async getProfile(userId: string) {
    const partner = await prisma.deliveryPartner.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            fullName: true,
            phone: true,
            email: true,
            avatarUrl: true,
            preferredLanguage: true,
            kycStatus: true,
            status: true,
          },
        },
      },
    });

    if (!partner) {
      throw new ApiError('DELIVERY_PARTNER_NOT_FOUND', 'Delivery partner profile not found', 404);
    }

    return partner;
  }

  static async toggleAvailability(userId: string, isAvailable: boolean, lat?: number, lng?: number) {
    const partner = await prisma.deliveryPartner.findUnique({ where: { userId } });
    if (!partner) {
      throw new ApiError('DELIVERY_PARTNER_NOT_FOUND', 'Delivery partner profile not found', 404);
    }

    const updated = await prisma.deliveryPartner.update({
      where: { id: partner.id },
      data: {
        isAvailable,
        ...(lat !== undefined && { currentLat: lat }),
        ...(lng !== undefined && { currentLng: lng }),
        lastLocationAt: new Date(),
      },
    });

    return updated;
  }

  static async updateLocation(
    userId: string,
    latitude: number,
    longitude: number,
    accuracy?: number,
    deliveryId?: string
  ) {
    const partner = await prisma.deliveryPartner.findUnique({ where: { userId } });
    if (!partner) {
      throw new ApiError('DELIVERY_PARTNER_NOT_FOUND', 'Delivery partner profile not found', 404);
    }

    const now = new Date();

    // Update current location on DeliveryPartner
    const updatedPartner = await prisma.deliveryPartner.update({
      where: { id: partner.id },
      data: {
        currentLat: latitude,
        currentLng: longitude,
        lastLocationAt: now,
      },
    });

    // Record location history entry
    await prisma.deliveryLocation.create({
      data: {
        deliveryPartnerId: partner.id,
        deliveryId: deliveryId || null,
        latitude,
        longitude,
        accuracy: accuracy || null,
        timestamp: now,
      },
    });

    return {
      success: true,
      partnerId: partner.id,
      currentLat: latitude,
      currentLng: longitude,
      updatedAt: now,
    };
  }

  static async getEarnings(userId: string) {
    const partner = await prisma.deliveryPartner.findUnique({ where: { userId } });
    if (!partner) {
      throw new ApiError('DELIVERY_PARTNER_NOT_FOUND', 'Delivery partner profile not found', 404);
    }

    const completedDeliveries = await prisma.delivery.findMany({
      where: {
        deliveryPartnerId: partner.id,
        status: 'DELIVERED',
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            netAmount: true,
            createdAt: true,
            shippingAddress: { select: { district: true, villageTaluk: true } },
          },
        },
      },
      orderBy: { deliveredAt: 'desc' },
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    let todayEarnings = 0;
    let weekEarnings = 0;
    let totalEarnings = 0;

    const earningsBreakdown = completedDeliveries.map((del) => {
      const amount = del.earnings ? Number(del.earnings) : 85.0;
      const deliveredTime = del.deliveredAt || del.updatedAt;

      totalEarnings += amount;
      if (deliveredTime >= startOfToday) {
        todayEarnings += amount;
      }
      if (deliveredTime >= startOfWeek) {
        weekEarnings += amount;
      }

      return {
        id: del.id,
        orderId: del.orderId,
        orderNumber: del.order?.orderNumber || 'FS-1000',
        deliveredAt: deliveredTime,
        amount,
        settlementStatus: 'SETTLED', // Completed deliveries are automatically marked settled
        district: del.order?.shippingAddress?.district || 'Guntur',
        village: del.order?.shippingAddress?.villageTaluk || 'Local',
      };
    });

    return {
      todayEarnings,
      weekEarnings,
      totalEarnings,
      completedCount: completedDeliveries.length,
      pendingSettlement: 0,
      settledAmount: totalEarnings,
      earnings: earningsBreakdown,
    };
  }

  static async getDeliveryHistory(userId: string, statusFilter?: string) {
    const partner = await prisma.deliveryPartner.findUnique({ where: { userId } });
    if (!partner) {
      throw new ApiError('DELIVERY_PARTNER_NOT_FOUND', 'Delivery partner profile not found', 404);
    }

    const statusCondition = statusFilter && statusFilter !== 'ALL'
      ? { status: statusFilter }
      : { status: { in: ['DELIVERED', 'CANCELLED', 'FAILED'] } };

    const history = await prisma.delivery.findMany({
      where: {
        deliveryPartnerId: partner.id,
        ...statusCondition,
      },
      include: {
        order: {
          include: {
            shippingAddress: true,
            shop: { select: { shopName: true, addressLine: true, district: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return history;
  }

  static async createSupportTicket(userId: string, category: string, description: string, deliveryId?: string) {
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject: `[DELIVERY] ${category}${deliveryId ? ` - Delivery #${deliveryId}` : ''}`,
        priority: 'HIGH',
        description: description || category,
        status: 'OPEN',
      },
    });

    return ticket;
  }
}

