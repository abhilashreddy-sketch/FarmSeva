import { Request, Response, NextFunction } from 'express';
import { ConsultationService } from '../services/consultation-service';
import { createMessageSchema, submitGuidanceSchema, updateConsultationStatusSchema } from '../validations/consultation-validation';

export async function getFarmerConsultations(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const consultations = await ConsultationService.getFarmerConsultations(userId);

    return res.status(200).json({
      success: true,
      data: consultations,
    });
  } catch (error) {
    next(error);
  }
}

export async function getConsultationById(req: Request, res: Response, next: NextFunction) {
  try {
    const consultationId = req.params.id;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const consultation = await ConsultationService.getConsultationById(consultationId, userId, userRole);

    return res.status(200).json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendConsultationMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const consultationId = req.params.id;
    const validated = createMessageSchema.parse(req.body);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const message = await ConsultationService.sendMessage(consultationId, userId, userRole, validated);

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    next(error);
  }
}

export async function submitExpertGuidance(req: Request, res: Response, next: NextFunction) {
  try {
    const consultationId = req.params.id;
    const validated = submitGuidanceSchema.parse(req.body);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const guidance = await ConsultationService.submitGuidance(consultationId, userId, userRole, validated);

    return res.status(201).json({
      success: true,
      message: 'Expert guidance submitted successfully',
      data: guidance,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateConsultationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const consultationId = req.params.id;
    const { status } = updateConsultationStatusSchema.parse(req.body);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const updated = await ConsultationService.updateConsultationStatus(consultationId, status, userId, userRole);

    return res.status(200).json({
      success: true,
      message: 'Consultation status updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
