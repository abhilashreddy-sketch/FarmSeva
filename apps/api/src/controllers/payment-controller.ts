import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment-service';
import { sendSuccess } from '../utils/api-response';
import { verifyPaymentSchema } from '../validations/payment-validation';

export class PaymentController {
  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { orderId } = req.body;
      const payload = verifyPaymentSchema.parse(req.body);
      const result = await PaymentService.verifyAndProcessOnlinePayment(userId, {
        orderId,
        ...payload,
      });
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = JSON.stringify(req.body);
      const result = await PaymentService.processWebhook(rawBody, signature);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }
}
