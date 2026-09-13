import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserRole, UserStatus } from '@farm-seva/shared';
import { AuthService } from '../services/auth-service';
import { sendSuccess, sendError } from '../utils/api-response';
import { createCallCenterAgentSchema, updateUserStatusSchema } from '../validations/auth-validation';
import { logAuditEvent } from '../utils/audit-logger';

const prisma = new PrismaClient();

export class AdminUserController {
  /**
   * Admin creates a Call Center Agent account.
   */
  static async createCallCenterAgent(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'AUTH_UNAUTHORIZED', 'Admin authentication required', 401);
      }
      const validatedData = createCallCenterAgentSchema.parse(req.body);
      const agentUser = await AuthService.createCallCenterAgent(req.user.userId, validatedData);
      return sendSuccess(res, agentUser, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all users with pagination and role/status filtering.
   */
  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const roleFilter = req.query.role as UserRole | undefined;
      const statusFilter = req.query.status as UserStatus | undefined;

      const skip = (page - 1) * limit;

      const whereClause: any = {};
      if (roleFilter) whereClause.role = roleFilter;
      if (statusFilter) whereClause.status = statusFilter;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          skip,
          take: limit,
          select: {
            id: true,
            phone: true,
            email: true,
            fullName: true,
            role: true,
            status: true,
            preferredLanguage: true,
            createdAt: true,
            updatedAt: true,
            farmerProfile: true,
            sellerProfile: true,
            expertProfile: true,
            deliveryProfile: true,
            callCenterProfile: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      return sendSuccess(res, users, 200, { page, limit, total });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update User Account Status (ACTIVE, SUSPENDED, REJECTED, DEACTIVATED).
   */
  static async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'AUTH_UNAUTHORIZED', 'Admin authentication required', 401);
      }

      const { id } = req.params;
      const { status, reason } = updateUserStatusSchema.parse(req.body);

      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser) {
        return sendError(res, 'USER_NOT_FOUND', 'Target user not found', 404);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { status },
        select: { id: true, phone: true, fullName: true, role: true, status: true },
      });

      // If suspended or deactivated, invalidate all active refresh tokens immediately
      if (status === UserStatus.SUSPENDED || status === UserStatus.DEACTIVATED || status === UserStatus.REJECTED) {
        await prisma.refreshToken.updateMany({
          where: { userId: id, isRevoked: false },
          data: { isRevoked: true },
        });
      }

      await logAuditEvent({
        userId: req.user.userId,
        action: `ADMIN_UPDATE_USER_STATUS_${status}`,
        entityName: 'User',
        entityId: id,
        changesJson: { previousStatus: targetUser.status, newStatus: status, reason },
      });

      return sendSuccess(res, updatedUser, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin verifies or rejects a Seller registration.
   */
  static async verifySeller(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'AUTH_UNAUTHORIZED', 'Admin authentication required', 401);
      }

      const { id } = req.params;
      const { action, reason } = req.body; // action = 'APPROVE' | 'REJECT'

      const seller = await prisma.seller.findUnique({ where: { id } });
      if (!seller) {
        return sendError(res, 'SELLER_NOT_FOUND', 'Seller profile not found', 404);
      }

      const isApprove = action === 'APPROVE';
      const newSellerStatus = isApprove ? 'APPROVED' : 'REJECTED';
      const newUserStatus = isApprove ? UserStatus.ACTIVE : UserStatus.REJECTED;

      const updatedSeller = await prisma.seller.update({
        where: { id },
        data: {
          verificationStatus: newSellerStatus,
          verifiedAt: isApprove ? new Date() : null,
          verifiedByUserId: req.user.userId,
          rejectionReason: !isApprove ? reason : null,
          user: {
            update: { status: newUserStatus },
          },
        },
        include: { user: { select: { id: true, phone: true, fullName: true, status: true } } },
      });

      await logAuditEvent({
        userId: req.user.userId,
        action: `ADMIN_VERIFY_SELLER_${action}`,
        entityName: 'Seller',
        entityId: id,
        changesJson: { action, reason },
      });

      return sendSuccess(res, updatedSeller, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin Command Center Metrics API.
   */
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [
        totalFarmers,
        activeFarmers,
        totalSellers,
        pendingSellers,
        totalExperts,
        pendingExperts,
        ordersToday,
        ordersPending,
        ordersDelivered,
        failedPayments,
        openCropProblems,
        activeConsultations,
        failedNotifications,
      ] = await Promise.all([
        prisma.user.count({ where: { role: 'FARMER' } }),
        prisma.user.count({ where: { role: 'FARMER', status: 'ACTIVE' } }),
        prisma.seller.count(),
        prisma.seller.count({ where: { verificationStatus: 'SUBMITTED' } }),
        prisma.expert.count(),
        prisma.expert.count({ where: { verificationStatus: 'PENDING_VERIFICATION' } }),
        prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.order.count({ where: { status: { in: ['PENDING_ACCEPTANCE', 'ACCEPTED', 'PACKING'] } } }),
        prisma.order.count({ where: { status: 'DELIVERED' } }),
        prisma.payment.count({ where: { status: 'FAILED' } }),
        prisma.cropProblem.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW', 'EXPERT_ASSIGNED'] } } }),
        prisma.consultation.count({ where: { status: 'ACTIVE' } }),
        prisma.notificationDelivery.count({ where: { status: 'FAILED' } }),
      ]);

      const providerStatuses = {
        sms: process.env.SMS_PROVIDER_API_KEY ? 'CONFIGURED' : 'DEMO',
        whatsapp: process.env.WHATSAPP_API_KEY ? 'CONFIGURED' : 'DEMO',
        push: process.env.FCM_SERVER_KEY ? 'CONFIGURED' : 'DEMO',
        ivr: process.env.IVR_PROVIDER_API_KEY ? 'CONFIGURED' : 'DEMO',
        payment: process.env.RAZORPAY_KEY_SECRET ? 'CONFIGURED' : 'DEMO',
      };

      return sendSuccess(
        res,
        {
          totalFarmers,
          activeFarmers,
          totalSellers,
          pendingSellers,
          totalExperts,
          pendingExperts,
          ordersToday,
          ordersPending,
          ordersDelivered,
          failedPayments,
          openCropProblems,
          activeConsultations,
          failedNotifications,
          providerStatuses,
        },
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

