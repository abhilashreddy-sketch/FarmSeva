import { Request, Response, NextFunction } from 'express';
import { CropProblemService } from '../services/crop-problem-service';
import { createCropProblemSchema, updateCropProblemSchema, uploadCropImageSchema } from '../validations/crop-problem-validation';

export async function createCropProblem(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = createCropProblemSchema.parse(req.body);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Check if Call Center Agent is submitting for a target farmer
    let targetUserId = userId;
    let assistedByAgentUserId: string | undefined = undefined;

    if (userRole === 'CALL_CENTER_AGENT' && req.params.farmerUserId) {
      targetUserId = req.params.farmerUserId;
      assistedByAgentUserId = userId;
    }

    const problem = await CropProblemService.createCropProblem(targetUserId, userRole, validated, assistedByAgentUserId);

    return res.status(201).json({
      success: true,
      message: 'Crop problem reported successfully',
      data: problem,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFarmerCropProblems(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.farmerUserId || req.user!.userId;
    const problems = await CropProblemService.getFarmerCropProblems(userId, req.query);

    return res.status(200).json({
      success: true,
      data: problems,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCropProblemById(req: Request, res: Response, next: NextFunction) {
  try {
    const problemId = req.params.id;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const problem = await CropProblemService.getCropProblemById(problemId, userId, userRole);

    return res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    next(error);
  }
}

export async function addCropProblemImage(req: Request, res: Response, next: NextFunction) {
  try {
    const problemId = req.params.id;
    const validated = uploadCropImageSchema.parse(req.body);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const image = await CropProblemService.addCropProblemImage(problemId, userId, userRole, validated);

    return res.status(201).json({
      success: true,
      message: 'Crop image uploaded successfully',
      data: image,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCropProblemImage(req: Request, res: Response, next: NextFunction) {
  try {
    const problemId = req.params.id;
    const imageId = req.params.imageId;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    await CropProblemService.deleteCropProblemImage(problemId, imageId, userId, userRole);

    return res.status(200).json({
      success: true,
      message: 'Crop image deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function requestExpertConsultation(req: Request, res: Response, next: NextFunction) {
  try {
    const problemId = req.params.id;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const consultation = await CropProblemService.requestExpertConsultation(problemId, userId, userRole);

    return res.status(200).json({
      success: true,
      message: 'Expert consultation requested successfully',
      data: consultation,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCropProblemStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const problemId = req.params.id;
    const { status, resolutionNotes } = updateCropProblemSchema.parse(req.body);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    if (!status) {
      return res.status(400).json({ success: false, error: { code: 'STATUS_REQUIRED', message: 'Status is required' } });
    }

    const updated = await CropProblemService.updateCropProblemStatus(problemId, status, userId, userRole, resolutionNotes);

    return res.status(200).json({
      success: true,
      message: 'Crop problem status updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
