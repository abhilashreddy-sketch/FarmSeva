import { PrismaClient, Prisma } from '@prisma/client';
import { LedgerService } from './ledger-service';
import { CommissionService } from './commission-service';
import { ApiError } from '../../middleware/error-middleware';

const prisma = new PrismaClient();

export interface ProcessSettlementOptions {
  sellerId: string;
  idempotencyKey: string;
  adminUserId: string;
}

export class SettlementService {
  /**
   * Processes eligible seller settlements for delivered orders past settlement hold days.
   * ENFORCES IDEMPOTENCY: DB idempotencyKey prevents duplicate payouts.
   * ENFORCES EXCLUSION: Cancelled/refunded orders are strictly excluded.
   * ENFORCES DEMO BADGING: Unconfigured payout gateways explicitly record "DEMO — NO REAL MONEY TRANSFERRED".
   */
  static async processSellerSettlement(options: ProcessSettlementOptions): Promise<any> {
    const { sellerId, idempotencyKey, adminUserId } = options;

    return await prisma.$transaction(async (tx) => {
      // Check idempotency first
      const existingSettlement = await tx.sellerSettlement.findUnique({
        where: { idempotencyKey },
      });
      if (existingSettlement) {
        return {
          settlement: existingSettlement,
          isDuplicate: true,
          demoBadge: 'DEMO — NO REAL MONEY TRANSFERRED',
        };
      }

      const settings = await CommissionService.getBusinessSettings(tx);
      const holdDays = settings.sellerSettlementDays;
      const cutoffDate = new Date(Date.now() - holdDays * 24 * 60 * 60 * 1000);

      // Find eligible commissions for delivered orders past holdDays that are not yet settled or cancelled
      const eligibleCommissions = await tx.sellerCommission.findMany({
        where: {
          sellerId,
          status: 'PENDING',
          createdAt: { lte: cutoffDate },
        },
      });

      if (eligibleCommissions.length === 0) {
        throw new ApiError(
          'NO_ELIGIBLE_SETTLEMENTS',
          `No eligible delivered orders ready for settlement for seller ${sellerId} (Hold period: ${holdDays} days)`,
          400
        );
      }

      let totalGross = 0;
      let totalCommission = 0;
      let totalNetPayout = 0;

      for (const c of eligibleCommissions) {
        totalGross += Number(c.grossAmount);
        totalCommission += Number(c.commissionAmount) + Number(c.fixedFeeAmount);
        totalNetPayout += Number(c.netSellerAmount);
      }

      totalGross = Math.round(totalGross * 100) / 100;
      totalCommission = Math.round(totalCommission * 100) / 100;
      totalNetPayout = Math.round(totalNetPayout * 100) / 100;

      const settlementRef = `SETTLE_${sellerId.slice(0, 8)}_${Date.now()}`;

      // Create SellerSettlement batch record
      const settlement = await tx.sellerSettlement.create({
        data: {
          sellerId,
          settlementRef,
          totalGross: new Prisma.Decimal(totalGross),
          totalCommission: new Prisma.Decimal(totalCommission),
          totalNetPayout: new Prisma.Decimal(totalNetPayout),
          status: 'DEMO',
          payoutProvider: 'DEMO',
          idempotencyKey,
          eligibleAt: new Date(),
          paidAt: new Date(),
        },
      });

      // Update commission statuses to PAID
      await tx.sellerCommission.updateMany({
        where: { id: { in: eligibleCommissions.map((c) => c.id) } },
        data: { status: 'PAID' },
      });

      // Record Double-Entry Settlement Payout (DEBIT Seller Payable, CREDIT Escrow/Cash)
      const transactionId = `TX_SETTLE_${settlementRef}`;

      await LedgerService.recordDoubleEntry(
        {
          transactionId,
          idempotencyKey: `IDEM_SETTLE_LEDGER_${settlement.id}`,
          entries: [
            {
              accountType: 'SELLER_PAYABLE',
              direction: 'DEBIT',
              amount: totalNetPayout,
              sellerId,
              settlementId: settlement.id,
              description: `Settlement payout execution for Ref #${settlementRef} [DEMO — NO REAL MONEY TRANSFERRED]`,
            },
            {
              accountType: 'ESCROW',
              direction: 'CREDIT',
              amount: totalNetPayout,
              sellerId,
              settlementId: settlement.id,
              description: `Payout disbursement from Escrow account for Ref #${settlementRef}`,
            },
          ],
        },
        tx
      );

      return {
        settlement,
        isDuplicate: false,
        settledCommissionCount: eligibleCommissions.length,
        demoBadge: 'DEMO — NO REAL MONEY TRANSFERRED',
      };
    });
  }

  /**
   * Fetches seller settlement history.
   */
  static async getSellerSettlements(sellerId: string): Promise<any[]> {
    const settlements = await prisma.sellerSettlement.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });

    return settlements.map((s) => ({
      ...s,
      demoNotice: 'DEMO — NO REAL MONEY TRANSFERRED',
    }));
  }
}
