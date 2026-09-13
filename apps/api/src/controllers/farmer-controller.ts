import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { FarmerService, DEMO_CROP_MASTER_DATA } from '../services/farmer-service';
import { sendSuccess, sendError } from '../utils/api-response';

const prisma = new PrismaClient();
import {
  updateFarmerProfileSchema,
  createFarmSchema,
  updateFarmSchema,
  createFieldSchema,
  updateFieldSchema,
  createCropSchema,
  updateCropSchema,
} from '../validations/farmer-validation';

export class FarmerController {
  // --------------------------------------------------
  // FARMER PROFILE
  // --------------------------------------------------
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const profile = await FarmerService.getOrCreateFarmerProfile(req.user.userId);
      return sendSuccess(res, profile, 200);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const validatedData = updateFarmerProfileSchema.parse(req.body);
      const updatedProfile = await FarmerService.updateFarmerProfile(req.user.userId, validatedData);
      return sendSuccess(res, updatedProfile, 200);
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------
  // FARMS
  // --------------------------------------------------
  static async getFarms(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const targetFarmerUserId = req.query.farmerUserId as string | undefined;
      const farms = await FarmerService.getFarmerFarms(req.user.userId, targetFarmerUserId, req.user.role);
      return sendSuccess(res, farms, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getFarmById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const farm = await FarmerService.getFarmById(req.params.id, req.user.userId, req.user.role);
      return sendSuccess(res, farm, 200);
    } catch (error) {
      next(error);
    }
  }

  static async createFarm(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const validatedData = createFarmSchema.parse(req.body);
      const farm = await FarmerService.createFarm(req.user.userId, validatedData);
      return sendSuccess(res, farm, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateFarm(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const validatedData = updateFarmSchema.parse(req.body);
      const updatedFarm = await FarmerService.updateFarm(req.params.id, req.user.userId, validatedData, req.user.role);
      return sendSuccess(res, updatedFarm, 200);
    } catch (error) {
      next(error);
    }
  }

  static async deleteFarm(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const result = await FarmerService.deleteFarm(req.params.id, req.user.userId, req.user.role);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------
  // FIELDS
  // --------------------------------------------------
  static async createField(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const validatedData = createFieldSchema.parse(req.body);
      const field = await FarmerService.createField(req.params.farmId, req.user.userId, validatedData, req.user.role);
      return sendSuccess(res, field, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateField(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const validatedData = updateFieldSchema.parse(req.body);
      const field = await FarmerService.updateField(req.params.id, req.user.userId, validatedData, req.user.role);
      return sendSuccess(res, field, 200);
    } catch (error) {
      next(error);
    }
  }

  static async deleteField(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const result = await FarmerService.deleteField(req.params.id, req.user.userId, req.user.role);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------
  // CROPS
  // --------------------------------------------------
  static async getCrops(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const crops = await FarmerService.getFarmerCrops(req.user.userId, req.user.role);
      return sendSuccess(res, crops, 200);
    } catch (error) {
      next(error);
    }
  }

  static async createCrop(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const validatedData = createCropSchema.parse(req.body);
      const crop = await FarmerService.createCrop(req.user.userId, validatedData, req.user.role);
      return sendSuccess(res, crop, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCrop(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const validatedData = updateCropSchema.parse(req.body);
      const crop = await FarmerService.updateCrop(req.params.id, req.user.userId, validatedData, req.user.role);
      return sendSuccess(res, crop, 200);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCrop(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const result = await FarmerService.deleteCrop(req.params.id, req.user.userId, req.user.role);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------
  // MASTER DATA & CALL CENTER SEARCH
  // --------------------------------------------------
  static getMasterData(req: Request, res: Response) {
    return sendSuccess(res, DEMO_CROP_MASTER_DATA, 200);
  }

  static async searchFarmersForCallCenter(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || (req.user.role !== 'CALL_CENTER_AGENT' && req.user.role !== 'ADMIN')) {
        return sendError(res, 'AUTH_FORBIDDEN', 'Call center agent or admin authorization required', 403);
      }

      const query = (req.query.q as string || req.query.phone as string || req.query.query as string || req.query.search as string || '').trim();
      if (!query || query.length < 3) {
        return sendError(res, 'VALIDATION_ERROR', 'Search query must be at least 3 characters', 400);
      }

      const farmers = await prisma.user.findMany({
        where: {
          role: 'FARMER',
          OR: [
            { phone: { contains: query } },
            { fullName: { contains: query } },
          ],
        },
        take: 10,
        select: {
          id: true,
          phone: true,
          fullName: true,
          status: true,
          preferredLanguage: true,
          farmerProfile: {
            include: {
              farms: { include: { fields: { include: { crops: true } } } },
              orders: { take: 5, orderBy: { createdAt: 'desc' }, include: { items: true, delivery: true } },
              cropProblems: { take: 5, orderBy: { submittedAt: 'desc' }, include: { crop: true, consultation: true } },
            },
          },
        },
      });

      return sendSuccess(res, farmers, 200);
    } catch (error) {
      next(error);
    }
  }
}

