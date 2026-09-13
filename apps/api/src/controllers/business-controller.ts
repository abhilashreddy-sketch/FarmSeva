import { Request, Response, NextFunction } from 'express';
import { CommissionService } from '../services/financial/commission-service';
import { SettlementService } from '../services/financial/settlement-service';
import { ReconciliationService } from '../services/financial/reconciliation-service';
import { LedgerService } from '../services/financial/ledger-service';
import { SellerAnalyticsService } from '../services/seller-analytics-service';
import { PromotionService } from '../services/promotion-service';
import { FarmerLoyaltyService } from '../services/farmer-loyalty-service';
import { sendSuccess, sendError } from '../utils/api-response';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BusinessController {
  /**
   * Admin fetches business settings.
   */
  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await CommissionService.getBusinessSettings();
      return sendSuccess(res, settings, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin updates business settings.
   */
  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        platformCommissionPercent,
        fixedTransactionFee,
        deliveryFeeDefault,
        minOrderValueForFreeDelivery,
        sellerSettlementDays,
        cancellationWindowHours,
      } = req.body;

      const updated = await prisma.businessSetting.upsert({
        where: { id: 'default' },
        update: {
          ...(platformCommissionPercent !== undefined && { platformCommissionPercent }),
          ...(fixedTransactionFee !== undefined && { fixedTransactionFee }),
          ...(deliveryFeeDefault !== undefined && { deliveryFeeDefault }),
          ...(minOrderValueForFreeDelivery !== undefined && { minOrderValueForFreeDelivery }),
          ...(sellerSettlementDays !== undefined && { sellerSettlementDays }),
          ...(cancellationWindowHours !== undefined && { cancellationWindowHours }),
        },
        create: {
          id: 'default',
          platformCommissionPercent: platformCommissionPercent || 5.0,
          fixedTransactionFee: fixedTransactionFee || 10.0,
          deliveryFeeDefault: deliveryFeeDefault || 50.0,
          minOrderValueForFreeDelivery: minOrderValueForFreeDelivery || 1000.0,
          sellerSettlementDays: sellerSettlementDays || 7,
          cancellationWindowHours: cancellationWindowHours || 24,
        },
      });

      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin executes seller settlement processing.
   */
  static async processSettlements(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Admin authentication required', 401);
      const { sellerId, idempotencyKey } = req.body;

      if (!sellerId || !idempotencyKey) {
        return sendError(res, 'VALIDATION_ERROR', 'sellerId and idempotencyKey are required', 400);
      }

      const result = await SettlementService.processSellerSettlement({
        sellerId,
        idempotencyKey,
        adminUserId: req.user.userId,
      });

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin financial reconciliation audit.
   */
  static async runReconciliation(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReconciliationService.runFullFinancialReconciliation();
      return sendSuccess(res, report, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin Business Revenue Dashboard.
   */
  static async getRevenueMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        totalOrders,
        totalDelivered,
        totalCancelled,
        orders,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'DELIVERED' } }),
        prisma.order.count({ where: { status: 'CANCELLED' } }),
        prisma.order.findMany({ select: { netAmount: true, totalItemsPrice: true } }),
      ]);

      const gmv = orders.reduce((sum, o) => sum + Number(o.totalItemsPrice), 0);
      const aov = totalOrders > 0 ? Math.round((gmv / totalOrders) * 100) / 100 : 0;
      const cancellationRate = totalOrders > 0 ? Math.round(((totalCancelled / totalOrders) * 100) * 10) / 10 : 0;

      const platformRevenue = await LedgerService.getAuthoritativePlatformRevenue();

      return sendSuccess(
        res,
        {
          grossGMV: Math.round(gmv * 100) / 100,
          platformRevenue,
          totalOrders,
          totalDelivered,
          totalCancelled,
          averageOrderValue: aov,
          cancellationRatePercent: cancellationRate,
          settlementMode: 'DEMO — NO REAL MONEY TRANSFERRED',
        },
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controlled CSV Export of Business Reports.
   */
  static async exportCSVReport(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await prisma.order.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: { shop: true },
      });

      let csv = 'OrderNumber,Date,Status,TotalItemsPrice,DeliveryFee,NetAmount\n';
      for (const o of orders) {
        csv += `${o.orderNumber},${o.createdAt.toISOString()},${o.status},${o.totalItemsPrice},${o.deliveryFee},${o.netAmount}\n`;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="farm_seva_revenue_report.csv"');
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Seller Analytics Dashboard.
   */
  static async getSellerDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const analytics = await SellerAnalyticsService.getSellerDashboardAnalytics(req.user.userId);
      return sendSuccess(res, analytics, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Farmer Coupon Validation.
   */
  static async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const { code, orderAmount, sellerId, categoryId } = req.body;

      const result = await PromotionService.validateCoupon({
        code,
        userId: req.user.userId,
        orderAmount,
        sellerId,
        categoryId,
      });

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Farmer Buy Again Reorder.
   */
  static async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const { orderId } = req.params;
      const { addressId } = req.body;

      const newOrder = await FarmerLoyaltyService.reorderPastOrder(orderId, req.user.userId, addressId);
      return sendSuccess(res, newOrder, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Farmer Favorites.
   */
  static async toggleFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const { favoriteType, targetId } = req.body;

      const result = await FarmerLoyaltyService.toggleFavorite(req.user.userId, favoriteType, targetId);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      const favorites = await FarmerLoyaltyService.getFavorites(req.user.userId);
      return sendSuccess(res, favorites, 200);
    } catch (error) {
      next(error);
    }
  }
}
