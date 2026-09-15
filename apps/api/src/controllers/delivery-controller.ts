import { Request, Response, NextFunction } from 'express';
import { DeliveryService } from '../services/delivery-service';
import { sendSuccess } from '../utils/api-response';
import { assignDeliverySchema, updateDeliveryStatusSchema } from '../validations/order-validation';

export class DeliveryController {
  static async getAssignedDeliveries(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const deliveries = await DeliveryService.getAssignedDeliveries(userId);
      return sendSuccess(res, deliveries, 200);
    } catch (err) {
      next(err);
    }
  }

  static async assignDeliveryPartner(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const { deliveryId } = req.params;
      const { deliveryPartnerId } = assignDeliverySchema.parse(req.body);
      const result = await DeliveryService.assignDeliveryPartner(adminUserId, deliveryId, deliveryPartnerId);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateDeliveryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { id } = req.params;
      const { status, deliveryOtp, notes } = updateDeliveryStatusSchema.parse(req.body);
      const result = await DeliveryService.updateDeliveryStatus(userId, userRole, id, status, deliveryOtp, notes);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await DeliveryService.getProfile(userId);
      return sendSuccess(res, profile, 200);
    } catch (err) {
      next(err);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { isAvailable, latitude, longitude } = req.body;
      const result = await DeliveryService.toggleAvailability(userId, Boolean(isAvailable), latitude, longitude);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { latitude, longitude, accuracy, deliveryId } = req.body;
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ success: false, error: { message: 'Latitude and Longitude are required' } });
      }
      const result = await DeliveryService.updateLocation(userId, Number(latitude), Number(longitude), accuracy, deliveryId);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getEarnings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const earnings = await DeliveryService.getEarnings(userId);
      return sendSuccess(res, earnings, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const statusFilter = req.query.status as string;
      const history = await DeliveryService.getDeliveryHistory(userId, statusFilter);
      return sendSuccess(res, history, 200);
    } catch (err) {
      next(err);
    }
  }

  static async createSupportTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { category, description, deliveryId } = req.body;
      const ticket = await DeliveryService.createSupportTicket(userId, category, description, deliveryId);
      return sendSuccess(res, ticket, 201);
    } catch (err) {
      next(err);
    }
  }
}
