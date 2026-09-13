import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/error-middleware';
import { logAuditEvent } from '../utils/audit-logger';

const prisma = new PrismaClient();

export class ExpertService {
  /**
   * Get Expert Assigned Cases & Queue.
   */
  static async getExpertCases(userId: string) {
    const expert = await prisma.expert.findUnique({ where: { userId } });
    if (!expert) throw new ApiError('EXPERT_NOT_FOUND', 'Expert profile not found', 404);

    const assignedConsultations = await prisma.consultation.findMany({
      where: { expertId: expert.id },
      include: {
        cropProblem: {
          include: {
            farmer: { include: { user: { select: { fullName: true, phone: true } } } },
            farm: true,
            field: true,
            crop: true,
            images: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const unassignedQueue = await prisma.cropProblem.findMany({
      where: {
        status: { in: ['OPEN', 'UNDER_REVIEW'] },
        consultation: { is: null },
      },
      include: {
        farmer: { include: { user: { select: { fullName: true } } } },
        farm: true,
        field: true,
        crop: true,
        images: true,
      },
      orderBy: { submittedAt: 'asc' },
    });

    return {
      expertProfile: expert,
      assignedCases: assignedConsultations,
      unassignedQueue,
    };
  }

  /**
   * Self-Assign Unassigned Crop Problem to Expert with Atomic Lock.
   */
  static async assignExpertToProblem(problemId: string, expertUserId: string) {
    const expert = await prisma.expert.findUnique({ where: { userId: expertUserId } });
    if (!expert) throw new ApiError('EXPERT_NOT_FOUND', 'Expert profile not found', 404);

    if (expert.verificationStatus !== 'VERIFIED') {
      throw new ApiError('EXPERT_NOT_VERIFIED', 'Expert account is not verified for farmer consultations', 403);
    }

    return prisma.$transaction(async (tx) => {
      const problem = await tx.cropProblem.findUnique({
        where: { id: problemId },
        include: { consultation: true },
      });

      if (!problem) throw new ApiError('CROP_PROBLEM_NOT_FOUND', 'Crop problem not found', 404);

      // Check if already claimed by another expert
      if (
        problem.status === 'EXPERT_ASSIGNED' ||
        problem.status === 'IN_CONSULTATION' ||
        problem.status === 'GUIDANCE_PROVIDED' ||
        problem.status === 'RESOLVED' ||
        problem.status === 'CLOSED' ||
        (problem.consultation && problem.consultation.expertId && problem.consultation.expertId !== expert.id)
      ) {
        throw new ApiError('CASE_ALREADY_ASSIGNED', 'This crop problem case has already been claimed by another expert', 409);
      }

      // Perform atomic status transition update
      const updateCount = await tx.cropProblem.updateMany({
        where: {
          id: problemId,
          status: { in: ['OPEN', 'UNDER_REVIEW', 'SUBMITTED'] },
        },
        data: { status: 'EXPERT_ASSIGNED' },
      });

      if (updateCount.count === 0 && problem.status !== 'EXPERT_ASSIGNED') {
        throw new ApiError('CASE_ALREADY_ASSIGNED', 'This crop problem case has already been claimed by another expert', 409);
      }

      let consultation = problem.consultation;
      if (!consultation) {
        consultation = await tx.consultation.create({
          data: {
            cropProblemId: problemId,
            expertId: expert.id,
            status: 'ASSIGNED',
            startedAt: new Date(),
          },
        });
      } else {
        consultation = await tx.consultation.update({
          where: { id: consultation.id },
          data: {
            expertId: expert.id,
            status: 'ASSIGNED',
            startedAt: new Date(),
          },
        });
      }

      await logAuditEvent({
        userId: expertUserId,
        action: 'EXPERT_ASSIGNED',
        entityName: 'CropProblem',
        entityId: problemId,
        changesJson: JSON.stringify({ expertId: expert.id }),
      });

      return consultation;
    });
  }

  /**
   * Admin Assign / Reassign Expert to Problem.
   */
  static async adminAssignExpert(problemId: string, targetExpertId: string, adminUserId: string) {
    const expert = await prisma.expert.findUnique({ where: { id: targetExpertId } });
    if (!expert) throw new ApiError('EXPERT_NOT_FOUND', 'Target expert record not found', 404);

    const problem = await prisma.cropProblem.findUnique({
      where: { id: problemId },
      include: { consultation: true },
    });

    if (!problem) throw new ApiError('CROP_PROBLEM_NOT_FOUND', 'Crop problem not found', 404);

    let consultation = problem.consultation;
    if (!consultation) {
      consultation = await prisma.consultation.create({
        data: {
          cropProblemId: problemId,
          expertId: expert.id,
          status: 'ASSIGNED',
          startedAt: new Date(),
        },
      });
    } else {
      consultation = await prisma.consultation.update({
        where: { id: consultation.id },
        data: {
          expertId: expert.id,
          status: 'ASSIGNED',
        },
      });
    }

    await prisma.cropProblem.update({
      where: { id: problemId },
      data: { status: 'EXPERT_ASSIGNED' },
    });

    await logAuditEvent({
      userId: adminUserId,
      action: 'ADMIN_ASSIGNED_EXPERT',
      entityName: 'CropProblem',
      entityId: problemId,
      changesJson: JSON.stringify({ targetExpertId }),
    });

    return consultation;
  }

  /**
   * Admin Verify Expert Account.
   */
  static async adminVerifyExpert(expertId: string, verificationStatus: string, adminUserId: string) {
    const expert = await prisma.expert.findUnique({ where: { id: expertId } });
    if (!expert) throw new ApiError('EXPERT_NOT_FOUND', 'Expert not found', 404);

    const updated = await prisma.expert.update({
      where: { id: expertId },
      data: { verificationStatus },
    });

    await logAuditEvent({
      userId: adminUserId,
      action: 'ADMIN_VERIFIED_EXPERT',
      entityName: 'Expert',
      entityId: expertId,
      changesJson: JSON.stringify({ verificationStatus }),
    });

    return updated;
  }

  /**
   * Admin List Experts.
   */
  static async adminListExperts() {
    return prisma.expert.findMany({
      include: {
        user: { select: { id: true, fullName: true, phone: true, email: true, status: true } },
        _count: { select: { consultations: true, guidances: true } },
      },
      orderBy: { rating: 'desc' },
    });
  }
}
