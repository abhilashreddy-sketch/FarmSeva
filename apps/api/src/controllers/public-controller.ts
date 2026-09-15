import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/api-response';
import { Logger } from '../utils/logger';

const prisma = new PrismaClient();

// In-memory cache for public stats (5 minute TTL)
let statsCache: { data: any; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export class PublicController {
  /**
   * GET /api/v1/public/stats
   * Returns aggregated real database counts for active platform participants.
   * Cached for 5 minutes with strict business definitions and zero personal data.
   */
  static async getPublicStats(req: Request, res: Response) {
    try {
      const now = Date.now();
      if (statsCache && statsCache.expiresAt > now) {
        res.setHeader('X-Cache', 'HIT');
        return sendSuccess(res, statsCache.data);
      }

      const [activeFarmers, verifiedSellers, certifiedExperts, approvedProducts, districtShops] = await Promise.all([
        prisma.user.count({
          where: { role: 'FARMER', status: 'ACTIVE' },
        }),
        prisma.seller.count({
          where: { verificationStatus: 'VERIFIED' },
        }),
        prisma.expert.count({
          where: { verificationStatus: 'VERIFIED' },
        }),
        prisma.product.count({
          where: { status: 'APPROVED' },
        }),
        prisma.shop.findMany({
          select: { district: true },
          distinct: ['district'],
        }),
      ]);

      const statsData = {
        activeFarmers,
        activeDealers: verifiedSellers,
        certifiedExperts,
        approvedProducts,
        districtsCovered: districtShops.length,
        timestamp: new Date().toISOString(),
      };

      statsCache = {
        data: statsData,
        expiresAt: now + CACHE_TTL_MS,
      };

      res.setHeader('X-Cache', 'MISS');
      return sendSuccess(res, statsData);
    } catch (err: any) {
      Logger.error('Failed to query public stats', err);
      return sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to retrieve platform statistics', 500);
    }
  }
}
