import { Request, Response, NextFunction } from 'express';
import { KycService } from '../services/kyc-service';
import { sendSuccess, sendError } from '../utils/api-response';
import z from 'zod';

const approveSchema = z.object({
  notes: z.string().optional(),
});

const rejectSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

const requestInfoSchema = z.object({
  notes: z.string().min(1, 'Note/instructions are required'),
});

export class AdminKycController {
  static async listApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const statusFilter = req.query.status as string | undefined;
      const applications = await KycService.listAdminKycApplications(statusFilter);
      return sendSuccess(res, { applications, count: applications.length }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'AUTH_UNAUTHORIZED', 'Admin authentication required', 401);
      }
      const { id } = req.params;
      const { notes } = approveSchema.parse(req.body);
      const result = await KycService.approveKyc(req.user.userId, id, notes);
      return sendSuccess(res, { kyc: result, message: 'KYC application approved successfully' }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'AUTH_UNAUTHORIZED', 'Admin authentication required', 401);
      }
      const { id } = req.params;
      const { rejectionReason } = rejectSchema.parse(req.body);
      const result = await KycService.rejectKyc(req.user.userId, id, rejectionReason);
      return sendSuccess(res, { kyc: result, message: 'KYC application rejected' }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async requestInfo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'AUTH_UNAUTHORIZED', 'Admin authentication required', 401);
      }
      const { id } = req.params;
      const { notes } = requestInfoSchema.parse(req.body);
      const result = await KycService.requestInfoKyc(req.user.userId, id, notes);
      return sendSuccess(res, { kyc: result, message: 'More information requested from applicant' }, 200);
    } catch (error) {
      next(error);
    }
  }
}
