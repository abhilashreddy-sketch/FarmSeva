import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/error-middleware';
import { logAuditEvent } from '../utils/audit-logger';
import { validateCropProblemStateTransition, CropProblemStatus } from '@farm-seva/shared';

const prisma = new PrismaClient();

export class CropProblemService {
  /**
   * Create a new Crop Problem with strict Farm/Field/Crop relationship validation.
   */
  static async createCropProblem(userId: string, userRole: string, data: any, assistedByAgentUserId?: string) {
    // Get Farmer Profile
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) {
      throw new ApiError('FARMER_NOT_FOUND', 'Farmer profile not found for user', 404);
    }

    // Verify Crop exists and belongs to farmer's farm/field
    const crop = await prisma.crop.findUnique({
      where: { id: data.cropId },
      include: {
        field: {
          include: {
            farm: true,
          },
        },
      },
    });

    if (!crop) {
      throw new ApiError('CROP_NOT_FOUND', 'Target crop record not found', 404);
    }

    // Check Farmer Ownership of Farm
    if (crop.field.farm.farmerId !== farmer.id) {
      throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Access to this crop is denied', 403);
    }

    // Validate supplied farmId matches crop's actual farmId
    if (data.farmId && data.farmId !== crop.field.farmId) {
      throw new ApiError(
        'AUTH_OWNERSHIP_DENIED',
        'Unauthorized: Supplied farmId does not match crop farm location',
        403
      );
    }

    // Validate supplied fieldId matches crop's actual fieldId
    if (data.fieldId && data.fieldId !== crop.fieldId) {
      throw new ApiError(
        'AUTH_OWNERSHIP_DENIED',
        'Unauthorized: Supplied fieldId does not match crop field location',
        403
      );
    }

    const farmId = crop.field.farmId;
    const fieldId = crop.fieldId;

    // Check agent if assisted
    let assistedByAgentId: string | undefined = undefined;
    if (assistedByAgentUserId) {
      const agent = await prisma.callCenterAgent.findUnique({ where: { userId: assistedByAgentUserId } });
      if (agent) assistedByAgentId = agent.id;
    }

    const cropProblem = await prisma.cropProblem.create({
      data: {
        farmerId: farmer.id,
        farmId,
        fieldId,
        cropId: crop.id,
        assistedByAgentId,
        title: data.title,
        description: data.description,
        category: data.category || 'OTHER',
        severity: data.severity || 'MEDIUM',
        affectedAreaAcres: data.affectedAreaAcres,
        symptomsObserved: data.symptomsObserved,
        observedDate: data.observedDate ? new Date(data.observedDate) : undefined,
        leafColor: data.leafColor,
        leafCondition: data.leafCondition,
        plantCondition: data.plantCondition,
        affectedArea: data.affectedArea,
        status: 'OPEN',
        priority: data.severity === 'URGENT' ? 'HIGH' : data.severity || 'MEDIUM',
      },
      include: {
        farm: true,
        field: true,
        crop: true,
        images: true,
      },
    });

    await logAuditEvent({
      userId: assistedByAgentUserId || userId,
      action: 'CROP_PROBLEM_CREATED',
      entityName: 'CropProblem',
      entityId: cropProblem.id,
      changesJson: JSON.stringify({ title: cropProblem.title, category: cropProblem.category }),
    });

    return cropProblem;
  }

  /**
   * Get Crop Problems for farmer with pagination & filtering.
   */
  static async getFarmerCropProblems(userId: string, filters: any = {}) {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) {
      throw new ApiError('FARMER_NOT_FOUND', 'Farmer profile not found', 404);
    }

    const where: any = { farmerId: farmer.id };
    if (filters.farmId) where.farmId = filters.farmId;
    if (filters.fieldId) where.fieldId = filters.fieldId;
    if (filters.cropId) where.cropId = filters.cropId;
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.severity) where.severity = filters.severity;

    return prisma.cropProblem.findMany({
      where,
      include: {
        farm: true,
        field: true,
        crop: true,
        images: true,
        consultation: {
          include: {
            expert: {
              include: { user: { select: { fullName: true } } },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  /**
   * Get Crop Problem Details with ownership security check.
   */
  static async getCropProblemById(problemId: string, userId: string, userRole: string) {
    const problem = await prisma.cropProblem.findUnique({
      where: { id: problemId },
      include: {
        farmer: { include: { user: true } },
        farm: true,
        field: true,
        crop: true,
        images: true,
        consultation: {
          include: {
            expert: { include: { user: true } },
            messages: {
              orderBy: { createdAt: 'asc' },
              include: { sender: { select: { id: true, fullName: true, role: true } } },
            },
            guidances: {
              orderBy: { createdAt: 'desc' },
              include: {
                expert: { include: { user: { select: { fullName: true } } } },
                referencedProduct: true,
              },
            },
          },
        },
      },
    });

    if (!problem) {
      throw new ApiError('CROP_PROBLEM_NOT_FOUND', 'Crop problem record not found', 404);
    }

    // Role-based Security Enforcement
    if (userRole === 'FARMER') {
      const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
      if (!farmer || problem.farmerId !== farmer.id) {
        throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Access to this crop problem is denied', 403);
      }

      // Hide internal notes from farmer
      if (problem.consultation) {
        problem.consultation.messages = problem.consultation.messages.filter((m) => !m.isInternalNote);
        problem.consultation.guidances = problem.consultation.guidances.filter(
          (g) => g.visibility === 'FARMER_VISIBLE'
        );
      }
    } else if (userRole === 'AGRICULTURAL_EXPERT') {
      const expert = await prisma.expert.findUnique({ where: { userId } });
      if (!expert) {
        throw new ApiError('EXPERT_NOT_FOUND', 'Expert profile not found', 404);
      }

      // Unassigned expert cannot access Expert B's assigned case
      if (problem.consultation && problem.consultation.expertId && problem.consultation.expertId !== expert.id) {
        throw new ApiError('AUTH_FORBIDDEN', 'Unauthorized: Expert not assigned to this case', 403);
      }
    }

    return problem;
  }

  /**
   * Upload Crop Problem Image.
   */
  static async addCropProblemImage(problemId: string, userId: string, userRole: string, imageData: any) {
    const problem = await prisma.cropProblem.findUnique({
      where: { id: problemId },
      include: { farmer: true },
    });

    if (!problem) {
      throw new ApiError('CROP_PROBLEM_NOT_FOUND', 'Crop problem not found', 404);
    }

    // Ownership check for farmer
    if (userRole === 'FARMER') {
      const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
      if (!farmer || problem.farmerId !== farmer.id) {
        throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Cannot modify this crop problem', 403);
      }
    }

    // Validate file size (e.g. max 10MB)
    if (imageData.fileSize && imageData.fileSize > 10 * 1024 * 1024) {
      throw new ApiError('FILE_TOO_LARGE', 'Image size exceeds maximum 10MB limit', 400);
    }

    // Validate unsafe file type
    if (imageData.fileType && !imageData.fileType.startsWith('image/')) {
      throw new ApiError('INVALID_FILE_TYPE', 'Only valid image files are allowed', 400);
    }

    return prisma.cropProblemImage.create({
      data: {
        cropProblemId: problemId,
        imageUrl: imageData.imageUrl,
        thumbnailUrl: imageData.thumbnailUrl || imageData.imageUrl,
        fileType: imageData.fileType || 'image/jpeg',
        fileSize: imageData.fileSize || 1024,
        caption: imageData.caption,
      },
    });
  }

  /**
   * Delete Crop Problem Image.
   */
  static async deleteCropProblemImage(problemId: string, imageId: string, userId: string, userRole: string) {
    const problem = await prisma.cropProblem.findUnique({ where: { id: problemId } });
    if (!problem) throw new ApiError('CROP_PROBLEM_NOT_FOUND', 'Crop problem not found', 404);

    if (userRole === 'FARMER') {
      const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
      if (!farmer || problem.farmerId !== farmer.id) {
        throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Cannot delete this image', 403);
      }
    }

    return prisma.cropProblemImage.delete({ where: { id: imageId } });
  }

  /**
   * Request Expert Consultation for Crop Problem.
   */
  static async requestExpertConsultation(problemId: string, userId: string, userRole: string) {
    const problem = await prisma.cropProblem.findUnique({
      where: { id: problemId },
      include: { consultation: true },
    });

    if (!problem) throw new ApiError('CROP_PROBLEM_NOT_FOUND', 'Crop problem not found', 404);

    if (userRole === 'FARMER') {
      const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
      if (!farmer || problem.farmerId !== farmer.id) {
        throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Cannot request expert for this problem', 403);
      }
    }

    // Update status to UNDER_REVIEW
    await prisma.cropProblem.update({
      where: { id: problemId },
      data: { status: 'UNDER_REVIEW' },
    });

    // Create or get Consultation
    let consultation = problem.consultation;
    if (!consultation) {
      consultation = await prisma.consultation.create({
        data: {
          cropProblemId: problemId,
          status: 'REQUESTED',
        },
      });
    }

    await logAuditEvent({
      userId,
      action: 'CONSULTATION_REQUESTED',
      entityName: 'CropProblem',
      entityId: problemId,
    });

    return consultation;
  }

  /**
   * Update Crop Problem Status with state machine validation.
   */
  static async updateCropProblemStatus(problemId: string, targetStatus: string, userId: string, userRole: any, notes?: string) {
    const problem = await prisma.cropProblem.findUnique({ where: { id: problemId } });
    if (!problem) throw new ApiError('CROP_PROBLEM_NOT_FOUND', 'Crop problem not found', 404);

    if (userRole === 'FARMER') {
      const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
      if (!farmer || problem.farmerId !== farmer.id) {
        throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Cannot modify this problem', 403);
      }
    }

    const currentStatus = problem.status as CropProblemStatus;
    const transitionCheck = validateCropProblemStateTransition(currentStatus, targetStatus as CropProblemStatus, userRole);
    if (!transitionCheck.isValid) {
      throw new ApiError('INVALID_STATE_TRANSITION', transitionCheck.error || 'Invalid transition', 400);
    }

    const updateData: any = { status: targetStatus };
    if (targetStatus === 'RESOLVED' || targetStatus === 'CLOSED') {
      updateData.resolvedAt = new Date();
      if (notes) updateData.resolutionNotes = notes;
    }

    const updated = await prisma.cropProblem.update({
      where: { id: problemId },
      data: updateData,
    });

    await logAuditEvent({
      userId,
      action: 'CROP_PROBLEM_STATUS_UPDATED',
      entityName: 'CropProblem',
      entityId: problemId,
      changesJson: JSON.stringify({ from: currentStatus, to: targetStatus }),
    });

    return updated;
  }
}
