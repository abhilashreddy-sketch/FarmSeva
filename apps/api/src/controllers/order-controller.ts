import { Request, Response, NextFunction } from 'express';
import { CheckoutService } from '../services/checkout-service';
import { OrderService } from '../services/order-service';
import { sendSuccess } from '../utils/api-response';
import { checkoutSchema, updateOrderStatusSchema } from '../validations/order-validation';

export class OrderController {
  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const payload = checkoutSchema.parse(req.body);
      const result = await CheckoutService.processCheckout(userId, payload);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getFarmerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const orders = await OrderService.getFarmerOrders(userId);
      return sendSuccess(res, orders, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getFarmerOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const order = await OrderService.getFarmerOrderById(userId, id);
      return sendSuccess(res, order, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getSellerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const orders = await OrderService.getSellerOrders(userId);
      return sendSuccess(res, orders, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getSellerOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const order = await OrderService.getSellerOrderById(userId, id);
      return sendSuccess(res, order, 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { id } = req.params;
      const { status, cancellationReason, rejectionReason } = updateOrderStatusSchema.parse(req.body);
      const order = await OrderService.updateOrderStatus(userId, userRole, id, status, {
        cancellationReason,
        rejectionReason,
      });
      return sendSuccess(res, order, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getAdminOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.getAdminOrders();
      return sendSuccess(res, orders, 200);
    } catch (err) {
      next(err);
    }
  }
}
