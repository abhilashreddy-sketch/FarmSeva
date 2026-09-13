import { Request, Response, NextFunction } from 'express';
import { ExpertService } from '../services/expert-service';
import { assignExpertSchema } from '../validations/crop-problem-validation';

export async function getExpertCases(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const cases = await ExpertService.getExpertCases(userId);

    return res.status(200).json({
      success: true,
      data: cases,
    });
  } catch (error) {
    next(error);
  }
}

export async function assignExpertToProblem(req: Request, res: Response, next: NextFunction) {
  try {
    const problemId = req.params.id;
    const userId = req.user!.userId;

    const consultation = await ExpertService.assignExpertToProblem(problemId, userId);

    return res.status(200).json({
      success: true,
      message: 'Expert self-assigned to problem successfully',
      data: consultation,
    });
  } catch (error) {
    next(error);
  }
}

export async function adminAssignExpert(req: Request, res: Response, next: NextFunction) {
  try {
    const problemId = req.params.id;
    const { expertId } = assignExpertSchema.parse(req.body);
    const adminUserId = req.user!.userId;

    const consultation = await ExpertService.adminAssignExpert(problemId, expertId, adminUserId);

    return res.status(200).json({
      success: true,
      message: 'Expert assigned by admin successfully',
      data: consultation,
    });
  } catch (error) {
    next(error);
  }
}

export async function adminVerifyExpert(req: Request, res: Response, next: NextFunction) {
  try {
    const expertId = req.params.id;
    const { verificationStatus } = req.body;
    const adminUserId = req.user!.userId;

    if (!verificationStatus) {
      return res.status(400).json({ success: false, error: { code: 'STATUS_REQUIRED', message: 'Verification status required' } });
    }

    const updated = await ExpertService.adminVerifyExpert(expertId, verificationStatus, adminUserId);

    return res.status(200).json({
      success: true,
      message: 'Expert verification status updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function adminListExperts(req: Request, res: Response, next: NextFunction) {
  try {
    const experts = await ExpertService.adminListExperts();

    return res.status(200).json({
      success: true,
      data: experts,
    });
  } catch (error) {
    next(error);
  }
}
