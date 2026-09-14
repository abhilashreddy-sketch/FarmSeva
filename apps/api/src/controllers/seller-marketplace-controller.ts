import { Request, Response, NextFunction } from 'express';
import { SellerMarketplaceService } from '../services/seller-marketplace-service';
import { StorageService } from '../services/storage-service';
import { sendSuccess } from '../utils/api-response';
import { ApiError } from '../middleware/error-middleware';
import {
  createSellerListingSchema,
  updateSellerListingSchema,
  createSellerProductSchema,
} from '../validations/marketplace-validation';

export class SellerMarketplaceController {
  static async getListings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await SellerMarketplaceService.getSellerListings(userId);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async createListing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const payload = createSellerListingSchema.parse(req.body);
      const listing = await SellerMarketplaceService.createListing(userId, payload);
      return sendSuccess(res, listing, 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateListing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const payload = updateSellerListingSchema.parse(req.body);
      const listing = await SellerMarketplaceService.updateListing(userId, id, payload);
      return sendSuccess(res, listing, 200);
    } catch (err) {
      next(err);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const payload = createSellerProductSchema.parse(req.body);
      const product = await SellerMarketplaceService.createProduct(userId, payload);
      return sendSuccess(res, product, 201);
    } catch (err) {
      next(err);
    }
  }

  static async uploadProductImage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      await SellerMarketplaceService.verifySellerStatus(userId);

      const file = req.file;
      if (!file) {
        throw new ApiError('MISSING_FILE', 'No image file uploaded', 400);
      }

      const uploaded = await StorageService.uploadProductPhoto({
        fileName: file.originalname,
        fileBuffer: file.buffer,
        mimeType: file.mimetype,
      });

      return sendSuccess(res, uploaded, 201);
    } catch (err) {
      next(err);
    }
  }
}

