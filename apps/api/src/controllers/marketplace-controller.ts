import { Request, Response, NextFunction } from 'express';
import { MarketplaceService } from '../services/marketplace-service';
import { sendSuccess } from '../utils/api-response';
import { getProductsQuerySchema, compareProductsQuerySchema } from '../validations/marketplace-validation';

export class MarketplaceController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await MarketplaceService.getCategories();
      return sendSuccess(res, categories, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const queryParams = getProductsQuerySchema.parse(req.query);
      const result = await MarketplaceService.getProducts(queryParams);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await MarketplaceService.getProductBySlug(slug);
      return sendSuccess(res, product, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getProductsForFarmerCrops(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await MarketplaceService.getProductsForFarmerCrops(userId);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async compareProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { productIds } = compareProductsQuerySchema.parse(req.query);
      const ids = productIds.split(',').map((id) => id.trim()).filter(Boolean);
      const comparison = await MarketplaceService.compareProducts(ids);
      return sendSuccess(res, comparison, 200);
    } catch (err) {
      next(err);
    }
  }
}
