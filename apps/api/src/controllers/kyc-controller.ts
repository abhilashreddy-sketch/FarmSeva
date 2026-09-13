import { Request, Response, NextFunction } from 'express';
import { KycService } from '../services/kyc-service';
import { sendSuccess, sendError } from '../utils/api-response';
import z from 'zod';

const panSchema = z.object({
  panNumber: z.string().min(1, 'PAN number is required'),
});

const aadhaarSchema = z.object({
  aadhaarNumber: z.string().min(1, 'Aadhaar number is required'),
  consent: z.boolean().refine((val) => val === true, 'Consent is required for Aadhaar verification'),
});

const submitKycSchema = z.object({
  drivingLicenseNo: z.string().optional(),
  vehicleType: z.string().optional(),
  vehicleNumber: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankIfsc: z.string().optional(),
});

const documentSchema = z.object({
  documentType: z.string().min(1, 'Document type is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().min(1, 'File URL is required'),
});

export class KycController {
  static async verifyPan(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      }
      const { panNumber } = panSchema.parse(req.body);
      const result = await KycService.verifyPan(req.user.userId, panNumber);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async verifyAadhaar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      }
      const { aadhaarNumber, consent } = aadhaarSchema.parse(req.body);
      const result = await KycService.verifyAadhaar(req.user.userId, aadhaarNumber, consent);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async submitKyc(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      }
      const validatedData = submitKycSchema.parse(req.body);
      const result = await KycService.submitKyc(req.user.userId, validatedData);
      return sendSuccess(res, { kyc: result, message: 'KYC submitted successfully. Status: UNDER_REVIEW' }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      }
      const validatedData = documentSchema.parse(req.body);
      const result = await KycService.uploadDocument(req.user.userId, validatedData);
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getKycStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      }
      const result = await KycService.getKycStatus(req.user.userId);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}
