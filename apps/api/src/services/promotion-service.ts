import { PrismaClient, Prisma } from '@prisma/client';
import { ApiError } from '../middleware/error-middleware';

const prisma = new PrismaClient();

export interface ValidateCouponOptions {
  code: string;
  userId: string;
  orderAmount: number;
  sellerId?: string;
  categoryId?: string;
}

export class PromotionService {
  /**
   * Validates coupon code server-side against anti-abuse constraints.
   */
  static async validateCoupon(options: ValidateCouponOptions): Promise<{
    isValid: boolean;
    promotion: any;
    discountAmount: number;
  }> {
    const { code, userId, orderAmount, sellerId, categoryId } = options;

    const promo = await prisma.promotion.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      throw new ApiError('INVALID_PROMOTION', 'Invalid or expired coupon code', 400);
    }

    if (promo.validUntil && new Date() > promo.validUntil) {
      throw new ApiError('EXPIRED_PROMOTION', 'Coupon code has expired', 400);
    }

    if (promo.usedCount >= promo.totalUsageLimit) {
      throw new ApiError('USAGE_LIMIT_EXCEEDED', 'Coupon max total usage limit reached', 400);
    }

    if (Number(promo.minOrderAmount) > 0 && orderAmount < Number(promo.minOrderAmount)) {
      throw new ApiError(
        'MIN_ORDER_AMOUNT_NOT_MET',
        `Minimum order amount of ₹${promo.minOrderAmount} required for this coupon`,
        400
      );
    }

    if (promo.applicableSellerId && sellerId && promo.applicableSellerId !== sellerId) {
      throw new ApiError('COUPON_NOT_APPLICABLE', 'Coupon not valid for selected seller', 400);
    }

    if (promo.applicableCategoryId && categoryId && promo.applicableCategoryId !== categoryId) {
      throw new ApiError('COUPON_NOT_APPLICABLE', 'Coupon not valid for selected category', 400);
    }

    if (promo.firstOrderOnly) {
      const previousOrders = await prisma.order.count({
        where: { farmer: { userId } },
      });
      if (previousOrders > 0) {
        throw new ApiError('FIRST_ORDER_ONLY', 'Coupon valid for first order only', 400);
      }
    }

    // Calculate discount amount server-side
    let discountAmount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discountAmount = (orderAmount * Number(promo.discountValue)) / 100;
      if (promo.maxDiscountAmount && discountAmount > Number(promo.maxDiscountAmount)) {
        discountAmount = Number(promo.maxDiscountAmount);
      }
    } else {
      discountAmount = Number(promo.discountValue);
    }

    discountAmount = Math.min(orderAmount, Math.round(discountAmount * 100) / 100);

    return {
      isValid: true,
      promotion: promo,
      discountAmount,
    };
  }

  /**
   * Applies coupon and increments usage counter atomically.
   */
  static async applyCoupon(code: string, userId: string, txPrisma?: Prisma.TransactionClient): Promise<void> {
    const client = txPrisma || prisma;
    await client.promotion.update({
      where: { code: code.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  }

  /**
   * Referral Code Generation & Validation Pipeline.
   * Prevents self-referrals and duplicate accounts.
   */
  static async createReferral(referrerUserId: string, refereeUserId: string, referralCode: string): Promise<any> {
    if (referrerUserId === refereeUserId) {
      throw new ApiError('SELF_REFERRAL_FORBIDDEN', 'Self-referrals are strictly prohibited', 400);
    }

    const existing = await prisma.referral.findUnique({
      where: { refereeUserId },
    });

    if (existing) {
      return existing;
    }

    return await prisma.referral.create({
      data: {
        referrerUserId,
        refereeUserId,
        referralCode,
        status: 'PENDING',
        rewardAmount: new Prisma.Decimal(50.0),
      },
    });
  }

  /**
   * Qualifies referral reward upon referee completing an order.
   */
  static async qualifyReferralOnOrder(refereeUserId: string, orderId: string): Promise<void> {
    const referral = await prisma.referral.findUnique({
      where: { refereeUserId },
    });

    if (referral && referral.status === 'PENDING') {
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          qualifyingOrderId: orderId,
          status: 'REWARD_GRANTED',
          grantedAt: new Date(),
        },
      });
    }
  }
}
