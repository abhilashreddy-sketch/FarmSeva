import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification-service';
import {
  updatePreferencesSchema,
  registerDeviceTokenSchema,
  emergencyBroadcastSchema,
  webhookPayloadSchema,
} from '../validations/notification-validation';

export class NotificationController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const unreadOnly = req.query.unreadOnly === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const result = await notificationService.getFarmerNotifications(userId, { unreadOnly, limit, offset });
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notificationId = req.params.id;

      const updated = await notificationService.markAsRead(userId, notificationId);
      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await notificationService.markAsRead(userId);
      return res.status(200).json({
        success: true,
        data: result,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const pref = await notificationService.getPreferences(userId);
      return res.status(200).json({
        success: true,
        data: pref,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const parsed = updatePreferencesSchema.parse(req.body);

      const updated = await notificationService.updatePreferences(userId, parsed);
      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Notification preferences updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async registerDeviceToken(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const parsed = registerDeviceTokenSchema.parse(req.body);

      const result = await notificationService.registerDeviceToken(userId, parsed.deviceToken, parsed.platform);
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Device token registered successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async dispatchEmergencyBroadcast(req: Request, res: Response, next: NextFunction) {
    try {
      const createdByUserId = req.user!.userId;
      const parsed = emergencyBroadcastSchema.parse(req.body);

      const broadcast = await notificationService.dispatchEmergencyBroadcast(createdByUserId, parsed as any);
      return res.status(201).json({
        success: true,
        data: broadcast,
        message: `Emergency broadcast initiated to ${broadcast.recipientCount} recipient(s)`,
      });
    } catch (error) {
      next(error);
    }
  }

  static async handleProviderWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const provider = req.params.provider || 'generic';
      const parsed = webhookPayloadSchema.parse(req.body);

      const result = await notificationService.processWebhook(provider, parsed);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
