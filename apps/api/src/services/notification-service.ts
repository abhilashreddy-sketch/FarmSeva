import { PrismaClient } from '@prisma/client';
import {
  NotificationChannel,
  NotificationPriority,
  NotificationType,
  NotificationTemplatePayload,
} from '@farm-seva/shared';
import { smsProvider } from './providers/sms-provider';
import { whatsAppProvider } from './providers/whatsapp-provider';
import { pushProvider } from './providers/push-provider';
import { ivrProvider } from './providers/ivr-provider';

const prisma = new PrismaClient();

export class NotificationService {
  /**
   * Primary single source of truth method for dispatching multi-channel notifications.
   */
  async dispatchNotification(payload: NotificationTemplatePayload) {
    try {
      const { userId, type, title, message, priority = NotificationPriority.MEDIUM, metadata, channels } = payload;

      // 1. Fetch recipient user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { notificationPreference: true, deviceTokens: { where: { isActive: true } } },
      });

      if (!user) {
        console.warn(`[NotificationService] Cannot dispatch notification: User ${userId} not found.`);
        return null;
      }

      // 2. Fetch or initialize default notification preferences
      let pref = user.notificationPreference;
      if (!pref) {
        pref = await prisma.notificationPreference.create({
          data: {
            userId: user.id,
            smsEnabled: true,
            whatsappEnabled: true,
            pushEnabled: true,
            inAppEnabled: true,
            language: user.preferredLanguage || 'en',
          },
        });
      }

      const userLang = pref.language || user.preferredLanguage || 'en';

      // 3. Create main In-App Notification record in database
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          title,
          message,
          type,
          priority,
          isRead: false,
          metadataJson: metadata ? JSON.stringify(metadata) : null,
        },
      });

      // 4. Determine channels to attempt based on payload request and user preferences
      const requestedChannels = channels && channels.length > 0
        ? channels
        : [NotificationChannel.IN_APP, NotificationChannel.SMS, NotificationChannel.WHATSAPP, NotificationChannel.PUSH];

      // Record IN_APP delivery record
      if (requestedChannels.includes(NotificationChannel.IN_APP) && pref.inAppEnabled) {
        await prisma.notificationDelivery.create({
          data: {
            notificationId: notification.id,
            channel: NotificationChannel.IN_APP,
            status: 'DELIVERED',
            provider: 'IN_APP',
            recipientPhone: user.phone,
            deliveredAt: new Date(),
          },
        });
      }

      // 5. Dispatch to SMS
      if (requestedChannels.includes(NotificationChannel.SMS)) {
        if (!user.phone) {
          await prisma.notificationDelivery.create({
            data: {
              notificationId: notification.id,
              channel: NotificationChannel.SMS,
              status: 'SKIPPED',
              provider: 'DEMO',
              recipientPhone: '',
              errorMessage: 'No phone number associated with user account',
            },
          });
        } else if (!pref.smsEnabled) {
          await prisma.notificationDelivery.create({
            data: {
              notificationId: notification.id,
              channel: NotificationChannel.SMS,
              status: 'SKIPPED',
              provider: 'DEMO',
              recipientPhone: user.phone,
              errorMessage: 'SMS disabled in user preferences',
            },
          });
        } else {
          const smsRes = await smsProvider.sendSms({
            recipientPhone: user.phone,
            message: `${title}: ${message}`,
            language: userLang,
          });

          await prisma.notificationDelivery.create({
            data: {
              notificationId: notification.id,
              channel: NotificationChannel.SMS,
              status: smsRes.status,
              provider: smsRes.provider,
              providerMessageId: smsRes.messageId,
              recipientPhone: smsRes.recipientPhone,
              deliveredAt: smsRes.status === 'SENT' ? new Date() : null,
              failedAt: smsRes.status === 'FAILED' ? new Date() : null,
              errorMessage: smsRes.error || null,
            },
          });
        }
      }

      // 6. Dispatch to WhatsApp
      if (requestedChannels.includes(NotificationChannel.WHATSAPP)) {
        if (!user.phone) {
          await prisma.notificationDelivery.create({
            data: {
              notificationId: notification.id,
              channel: NotificationChannel.WHATSAPP,
              status: 'SKIPPED',
              provider: 'DEMO',
              recipientPhone: '',
              errorMessage: 'No phone number associated with user account',
            },
          });
        } else if (!pref.whatsappEnabled) {
          await prisma.notificationDelivery.create({
            data: {
              notificationId: notification.id,
              channel: NotificationChannel.WHATSAPP,
              status: 'SKIPPED',
              provider: 'DEMO',
              recipientPhone: user.phone,
              errorMessage: 'WhatsApp disabled in user preferences',
            },
          });
        } else {
          const waRes = await whatsAppProvider.sendWhatsApp({
            recipientPhone: user.phone,
            templateName: `farm_seva_${type.toLowerCase()}`,
            language: userLang,
            parameters: { title, message },
            fallbackText: `${title}: ${message}`,
          });

          await prisma.notificationDelivery.create({
            data: {
              notificationId: notification.id,
              channel: NotificationChannel.WHATSAPP,
              status: waRes.status,
              provider: waRes.provider,
              providerMessageId: waRes.messageId,
              recipientPhone: waRes.recipientPhone,
              deliveredAt: waRes.status === 'SENT' ? new Date() : null,
              failedAt: waRes.status === 'FAILED' ? new Date() : null,
              errorMessage: waRes.error || null,
            },
          });
        }
      }

      // 7. Dispatch to Push Notification (FCM)
      if (requestedChannels.includes(NotificationChannel.PUSH)) {
        if (!pref.pushEnabled) {
          await prisma.notificationDelivery.create({
            data: {
              notificationId: notification.id,
              channel: NotificationChannel.PUSH,
              status: 'SKIPPED',
              provider: 'DEMO',
              errorMessage: 'Push disabled in user preferences',
            },
          });
        } else {
          const deviceTokens = await prisma.deviceToken.findMany({
            where: { userId },
          });

          if (deviceTokens.length === 0) {
            await prisma.notificationDelivery.create({
              data: {
                notificationId: notification.id,
                channel: NotificationChannel.PUSH,
                status: 'SKIPPED',
                provider: 'DEMO',
                errorMessage: 'No active device tokens found for user',
              },
            });
          } else {
            const pushRes = await pushProvider.sendPushNotification({
              deviceTokens: deviceTokens.map((d) => d.deviceToken),
              title,
              body: message,
              priority,
            });

            await prisma.notificationDelivery.create({
              data: {
                notificationId: notification.id,
                channel: NotificationChannel.PUSH,
                status: pushRes.status,
                provider: pushRes.provider,
                providerMessageId: pushRes.messageId,
                deliveredAt: pushRes.status === 'SENT' ? new Date() : null,
                failedAt: pushRes.status === 'FAILED' ? new Date() : null,
                errorMessage: pushRes.error || null,
              },
            });
          }
        }
      }

      // 8. Dispatch to IVR Voice Call (for URGENT priority or explicitly requested IVR channel)
      if (requestedChannels.includes(NotificationChannel.IVR) || priority === NotificationPriority.URGENT) {
        if (!user.phone) {
          await prisma.notificationDelivery.create({
            data: {
              notificationId: notification.id,
              channel: NotificationChannel.IVR,
              status: 'SKIPPED',
              provider: 'DEMO',
              recipientPhone: '',
              errorMessage: 'No phone number associated with user account',
            },
          });
        } else {
          const ivrRes = await ivrProvider.triggerVoiceCall({
            recipientPhone: user.phone,
            language: userLang,
            scriptText: `${title}. ${message}`,
          });

          await prisma.notificationDelivery.create({
            data: {
              notificationId: notification.id,
              channel: NotificationChannel.IVR,
              status: ivrRes.status,
              provider: ivrRes.provider,
              providerMessageId: ivrRes.callId,
              recipientPhone: ivrRes.recipientPhone,
              deliveredAt: ivrRes.status === 'SENT' ? new Date() : null,
              failedAt: ivrRes.status === 'FAILED' ? new Date() : null,
              errorMessage: ivrRes.error || null,
            },
          });
        }
      }

      return notification;
    } catch (error) {
      console.error('[NotificationService] Error in dispatchNotification:', error);
      // Return null rather than throwing to safeguard primary business transaction
      return null;
    }
  }

  /**
   * Retrieve farmer notifications with pagination and unread counts.
   */
  async getFarmerNotifications(userId: string, filter?: { unreadOnly?: boolean; limit?: number; offset?: number }) {
    const limit = filter?.limit ?? 20;
    const offset = filter?.offset ?? 0;

    const whereClause: any = { userId };
    if (filter?.unreadOnly) {
      whereClause.isRead = false;
    }

    const [items, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          deliveries: {
            select: {
              id: true,
              channel: true,
              status: true,
              provider: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.notification.count({ where: whereClause }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications: items,
      totalCount,
      unreadCount,
      limit,
      offset,
    };
  }

  /**
   * Mark notification(s) as read.
   */
  async markAsRead(userId: string, notificationId?: string) {
    if (notificationId) {
      const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId },
      });
      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      return prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true, readAt: new Date() },
      });
    }

    // Mark all as read for farmer
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Get or update notification preferences for user.
   */
  async getPreferences(userId: string) {
    let pref = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      pref = await prisma.notificationPreference.create({
        data: {
          userId,
          smsEnabled: true,
          whatsappEnabled: true,
          pushEnabled: true,
          inAppEnabled: true,
          language: user?.preferredLanguage || 'en',
        },
      });
    }

    return pref;
  }

  async updatePreferences(
    userId: string,
    data: {
      smsEnabled?: boolean;
      whatsappEnabled?: boolean;
      pushEnabled?: boolean;
      inAppEnabled?: boolean;
      language?: string;
    }
  ) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        ...data,
      },
      create: {
        userId,
        smsEnabled: data.smsEnabled ?? true,
        whatsappEnabled: data.whatsappEnabled ?? true,
        pushEnabled: data.pushEnabled ?? true,
        inAppEnabled: data.inAppEnabled ?? true,
        language: data.language ?? 'en',
      },
    });
  }

  /**
   * Register or activate FCM / Push device token.
   */
  async registerDeviceToken(userId: string, deviceToken: string, platform: string = 'ANDROID') {
    return prisma.deviceToken.upsert({
      where: { deviceToken },
      update: {
        userId,
        platform,
        isActive: true,
      },
      create: {
        userId,
        deviceToken,
        platform,
        isActive: true,
      },
    });
  }

  /**
   * Admin Emergency Regional Broadcast Portal dispatch.
   */
  async dispatchEmergencyBroadcast(
    createdByUserId: string,
    payload: {
      title: string;
      message: string;
      targetState?: string;
      targetDistrict?: string;
      targetCrop?: string;
      targetLanguage?: string;
      channels: NotificationChannel[];
    }
  ) {
    const broadcast = await prisma.emergencyBroadcast.create({
      data: {
        createdByUserId,
        title: payload.title,
        message: payload.message,
        targetState: payload.targetState || null,
        targetDistrict: payload.targetDistrict || null,
        targetCrop: payload.targetCrop || null,
        targetLanguage: payload.targetLanguage || null,
        channels: payload.channels.join(','),
        status: 'PROCESSING',
      },
    });

    // Query matching farmers
    const farmerWhere: any = { role: 'FARMER', status: 'ACTIVE' };
    if (payload.targetLanguage) {
      farmerWhere.preferredLanguage = payload.targetLanguage;
    }

    if (payload.targetState || payload.targetDistrict) {
      farmerWhere.farmerProfile = {
        is: {
          ...(payload.targetState && { state: payload.targetState }),
          ...(payload.targetDistrict && { district: payload.targetDistrict }),
        },
      };
    }

    const matchingUsers = await prisma.user.findMany({
      where: farmerWhere,
      select: { id: true },
    });

    let sentCount = 0;
    for (const targetUser of matchingUsers) {
      await this.dispatchNotification({
        userId: targetUser.id,
        type: NotificationType.EMERGENCY_BROADCAST,
        title: `🚨 EMERGENCY: ${payload.title}`,
        message: payload.message,
        priority: NotificationPriority.URGENT,
        metadata: { broadcastId: broadcast.id },
        channels: payload.channels,
      });
      sentCount++;
    }

    const updatedBroadcast = await prisma.emergencyBroadcast.update({
      where: { id: broadcast.id },
      data: {
        status: 'COMPLETED',
        recipientCount: sentCount,
        sentAt: new Date(),
      },
    });

    return updatedBroadcast;
  }

  /**
   * Process webhook status reports (DSR callbacks) from SMS/WhatsApp/Push providers.
   */
  async processWebhook(provider: string, payload: { providerMessageId: string; status: 'DELIVERED' | 'FAILED'; errorCode?: string; errorMessage?: string }) {
    const delivery = await prisma.notificationDelivery.findFirst({
      where: { providerMessageId: payload.providerMessageId },
    });

    if (!delivery) {
      return { success: false, message: 'Delivery record not found for message ID' };
    }

    const updated = await prisma.notificationDelivery.update({
      where: { id: delivery.id },
      data: {
        status: payload.status,
        deliveredAt: payload.status === 'DELIVERED' ? new Date() : delivery.deliveredAt,
        failedAt: payload.status === 'FAILED' ? new Date() : delivery.failedAt,
        errorCode: payload.errorCode || null,
        errorMessage: payload.errorMessage || null,
      },
    });

    return { success: true, delivery: updated };
  }
}

export const notificationService = new NotificationService();
