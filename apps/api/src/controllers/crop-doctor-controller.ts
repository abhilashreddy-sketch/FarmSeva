import { Request, Response, NextFunction } from 'express';
import { CropDoctorService } from '../services/crop-doctor-service';

export class CropDoctorController {
  /**
   * POST /api/v1/crop-doctor/analyze
   * Photo diagnosis via AI Vision.
   */
  static async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId || (req as any).user.id;
      const files = (req as any).files as Array<{ originalname: string; buffer: Buffer; mimetype: string; size: number }>;

      const result = await CropDoctorService.analyzeAndStoreDiagnosis({
        userId,
        files: files || [],
        crop: req.body.crop,
        problemLocation: req.body.problemLocation,
        problemDuration: req.body.problemDuration,
        farmerNotes: req.body.farmerNotes,
        preferredLanguage: req.body.preferredLanguage,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/crop-doctor/history
   * Retrieve farmer's diagnosis history.
   */
  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId || (req as any).user.id;
      const history = await CropDoctorService.getFarmerDiagnoses(userId);

      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/crop-doctor/:id
   * Retrieve single diagnosis record.
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId || (req as any).user.id;
      const userRole = (req as any).user.role;
      const { id } = req.params;

      const diagnosis = await CropDoctorService.getDiagnosisById(userId, id, userRole);

      return res.status(200).json({
        success: true,
        data: diagnosis,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/crop-doctor/:id/escalate
   * Escalate diagnosis to official FARM SEVA Expert Consultation.
   */
  static async escalate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId || (req as any).user.id;
      const { id } = req.params;
      const { farmerNotes } = req.body;

      const result = await CropDoctorService.escalateToExpert(userId, id, farmerNotes);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
