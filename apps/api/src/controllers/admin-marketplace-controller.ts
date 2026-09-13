import { Request, Response, NextFunction } from 'express';
import { AdminMarketplaceService } from '../services/admin-marketplace-service';
import { sendSuccess } from '../utils/api-response';
import { createCategorySchema, adminApproveProductSchema } from '../validations/marketplace-validation';

export class AdminMarketplaceController {
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createCategorySchema.parse(req.body);
      const category = await AdminMarketplaceService.createCategory(payload);
      return sendSuccess(res, category, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getPendingProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await AdminMarketplaceService.getPendingProducts();
      return sendSuccess(res, products, 200);
    } catch (err) {
      next(err);
    }
  }

  static async reviewProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const { id } = req.params;
      const { status, rejectionReason } = adminApproveProductSchema.parse(req.body);
      const product = await AdminMarketplaceService.reviewProduct(adminUserId, id, status, rejectionReason);
      return sendSuccess(res, product, 200);
    } catch (err) {
      next(err);
    }
  }
}
