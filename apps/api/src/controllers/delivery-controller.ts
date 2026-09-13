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
}
