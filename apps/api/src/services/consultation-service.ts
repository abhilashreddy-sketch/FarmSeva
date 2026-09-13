import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/error-middleware';
import { logAuditEvent } from '../utils/audit-logger';
import { validateConsultationStateTransition, ConsultationStatus, NotificationType, NotificationPriority } from '@farm-seva/shared';
import { notificationService } from './notification-service';

const prisma = new PrismaClient();

export class ConsultationService {
  /**
   * Get Farmer Consultations.
   */
  static async getFarmerConsultations(userId: string) {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) throw new ApiError('FARMER_NOT_FOUND', 'Farmer profile not found', 404);

    const consultations = await prisma.consultation.findMany({
      where: {
        cropProblem: { farmerId: farmer.id },
      },
      include: {
        cropProblem: {
          include: { farm: true, field: true, crop: true, images: true },
        },
        expert: {
          include: { user: { select: { fullName: true, phone: true } } },
        },
        guidances: {
          where: { visibility: 'FARMER_VISIBLE' },
          orderBy: { createdAt: 'desc' },
          include: { referencedProduct: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return consultations;
  }

  /**
   * Get Consultation Details with Participant & Privacy Security.
   */
  static async getConsultationById(consultationId: string, userId: string, userRole: string) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        cropProblem: {
          include: {
            farmer: { include: { user: true } },
            farm: true,
            field: true,
            crop: true,
            images: true,
          },
        },
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
    });

    if (!consultation) {
      throw new ApiError('CONSULTATION_NOT_FOUND', 'Consultation record not found', 404);
    }

    // Role-based Access & Security Check
    if (userRole === 'FARMER') {
      const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
      if (!farmer || consultation.cropProblem.farmerId !== farmer.id) {
        throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Access to this consultation is denied', 403);
      }

      // Hide internal notes from farmer
      consultation.messages = consultation.messages.filter((m) => !m.isInternalNote);
      consultation.guidances = consultation.guidances.filter((g) => g.visibility === 'FARMER_VISIBLE');
    } else if (userRole === 'AGRICULTURAL_EXPERT') {
      const expert = await prisma.expert.findUnique({ where: { userId } });
      if (!expert) throw new ApiError('EXPERT_NOT_FOUND', 'Expert profile not found', 404);

      if (consultation.expertId && consultation.expertId !== expert.id) {
        throw new ApiError('AUTH_FORBIDDEN', 'Unauthorized: You are not assigned to this consultation', 403);
      }
    } else if (userRole === 'SELLER' || userRole === 'DELIVERY_PARTNER') {
      throw new ApiError('AUTH_FORBIDDEN', 'Unauthorized role access to consultation', 403);
    }

    return consultation;
  }

  /**
   * Send Message in Consultation.
   */
  static async sendMessage(consultationId: string, userId: string, userRole: string, data: any) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { cropProblem: { include: { farmer: true } } },
    });

    if (!consultation) throw new ApiError('CONSULTATION_NOT_FOUND', 'Consultation not found', 404);

    // Participant Security
    if (userRole === 'FARMER') {
      const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
      if (!farmer || consultation.cropProblem.farmerId !== farmer.id) {
        throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Cannot message in this consultation', 403);
      }
    } else if (userRole === 'AGRICULTURAL_EXPERT') {
      const expert = await prisma.expert.findUnique({ where: { userId } });
      if (!expert || (consultation.expertId && consultation.expertId !== expert.id)) {
        throw new ApiError('AUTH_FORBIDDEN', 'Unauthorized: Unassigned expert cannot send message', 403);
      }
    } else if (userRole !== 'ADMIN' && userRole !== 'CALL_CENTER_AGENT') {
      throw new ApiError('AUTH_FORBIDDEN', 'Unauthorized role for consultation chat', 403);
    }

    const isInternalNote = (userRole === 'AGRICULTURAL_EXPERT' || userRole === 'ADMIN' || userRole === 'CALL_CENTER_AGENT') ? !!data.isInternalNote : false;

    const message = await prisma.consultationMessage.create({
      data: {
        consultationId,
        senderId: userId, // Always derive from session!
        message: data.message,
        isInternalNote,
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
      },
    });

    // Update status based on who sent message
    let nextStatus: ConsultationStatus = consultation.status as ConsultationStatus;
    if (userRole === 'FARMER' && consultation.status === 'WAITING_FOR_FARMER') {
      nextStatus = 'ACTIVE';
    } else if (userRole === 'AGRICULTURAL_EXPERT' && consultation.status === 'WAITING_FOR_EXPERT') {
      nextStatus = 'ACTIVE';
    }

    if (nextStatus !== consultation.status) {
      await prisma.consultation.update({
        where: { id: consultationId },
        data: { status: nextStatus },
      });
    }

    // Trigger notification to farmer if non-internal message from expert/agent/admin
    if (!isInternalNote && userRole !== 'FARMER' && consultation.cropProblem.farmer.userId) {
      notificationService
        .dispatchNotification({
          userId: consultation.cropProblem.farmer.userId,
          type: NotificationType.CONSULTATION_UPDATE,
          title: 'New Message from Agricultural Expert',
          message: data.message,
          priority: NotificationPriority.HIGH,
          metadata: { consultationId, cropProblemId: consultation.cropProblemId },
        })
        .catch(err => console.error('[ConsultationService] Error dispatching message notification:', err));
    }

    return message;
  }

  /**
   * Submit Expert Guidance.
   */
  static async submitGuidance(consultationId: string, userId: string, userRole: string, data: any) {
    if (userRole !== 'AGRICULTURAL_EXPERT' && userRole !== 'ADMIN') {
      throw new ApiError('AUTH_FORBIDDEN', 'Only certified experts or admins can submit guidance', 403);
    }

    const expert = await prisma.expert.findUnique({ where: { userId } });
    if (!expert && userRole !== 'ADMIN') {
      throw new ApiError('EXPERT_NOT_FOUND', 'Expert profile not found', 404);
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { cropProblem: { include: { farmer: true } } },
    });

    if (!consultation) throw new ApiError('CONSULTATION_NOT_FOUND', 'Consultation not found', 404);

    if (expert && consultation.expertId && consultation.expertId !== expert.id) {
      throw new ApiError('AUTH_FORBIDDEN', 'Unauthorized: You are not the assigned expert for this consultation', 403);
    }

    const guidance = await prisma.expertGuidance.create({
      data: {
        consultationId,
        expertId: expert ? expert.id : consultation.expertId || '',
        guidanceText: data.guidanceText,
        visibility: data.visibility || 'FARMER_VISIBLE',
        referencedProductId: data.referencedProductId || null,
      },
      include: {
        expert: { include: { user: { select: { fullName: true } } } },
        referencedProduct: true,
      },
    });

    // Update Consultation & Crop Problem status to GUIDANCE_PROVIDED / ACTIVE
    await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        diagnosisNotes: data.guidanceText,
        status: 'ACTIVE',
      },
    });

    await prisma.cropProblem.update({
      where: { id: consultation.cropProblemId },
      data: { status: 'GUIDANCE_PROVIDED' },
    });

    await logAuditEvent({
      userId,
      action: 'EXPERT_GUIDANCE_SUBMITTED',
      entityName: 'Consultation',
      entityId: consultationId,
      changesJson: JSON.stringify({ visibility: guidance.visibility }),
    });

    // Trigger notification to farmer if guidance is FARMER_VISIBLE
    if (guidance.visibility === 'FARMER_VISIBLE' && consultation.cropProblem.farmer.userId) {
      notificationService
        .dispatchNotification({
          userId: consultation.cropProblem.farmer.userId,
          type: NotificationType.CONSULTATION_UPDATE,
          title: 'Expert Advisory Provided',
          message: data.guidanceText,
          priority: NotificationPriority.HIGH,
          metadata: { consultationId, cropProblemId: consultation.cropProblemId },
        })
        .catch(err => console.error('[ConsultationService] Error dispatching guidance notification:', err));
    }

    return guidance;
  }

  /**
   * Update Consultation Status.
   */
  static async updateConsultationStatus(consultationId: string, targetStatus: string, userId: string, userRole: any) {
    const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } });
    if (!consultation) throw new ApiError('CONSULTATION_NOT_FOUND', 'Consultation not found', 404);

    const currentStatus = consultation.status as ConsultationStatus;
    const transitionCheck = validateConsultationStateTransition(
      currentStatus,
      targetStatus as ConsultationStatus,
      userRole
    );

    if (!transitionCheck.isValid) {
      throw new ApiError('INVALID_STATE_TRANSITION', transitionCheck.error || 'Invalid transition', 400);
    }

    const updateData: any = { status: targetStatus };
    if (targetStatus === 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.closedAt = new Date();
    }

    const updated = await prisma.consultation.update({
      where: { id: consultationId },
      data: updateData,
    });

    return updated;
  }
}

