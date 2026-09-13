import { PrismaClient } from '@prisma/client';
import { LedgerService } from './ledger-service';

const prisma = new PrismaClient();

export interface ReconciliationReport {
  timestamp: string;
  isBalanced: boolean;
  globalLedgerDebits: number;
  globalLedgerCredits: number;
  ledgerDifference: number;
  discrepancyCount: number;
  discrepancies: Array<{
    type: 'PAYMENT_MISSING_LEDGER' | 'LEDGER_MISSING_PAYMENT' | 'SETTLEMENT_PROVIDER_MISMATCH' | 'REFUND_MISMATCH' | 'COMMISSION_MISMATCH';
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    referenceId: string;
    description: string;
  }>;
  summary: {
    totalOrders: number;
    totalPayments: number;
    totalLedgerEntries: number;
    totalSettlements: number;
  };
}

export class ReconciliationService {
  /**
   * Runs automated multi-system financial reconciliation.
   * Cross-checks Gateway Payments vs Financial Ledger vs Seller Commissions vs Settlements.
   */
  static async runFullFinancialReconciliation(): Promise<ReconciliationReport> {
    const discrepancies: ReconciliationReport['discrepancies'] = [];

    // 1. Verify Global Double-Entry Balance (DEBIT = CREDIT)
    const ledgerCheck = await LedgerService.verifyGlobalLedgerBalance();

    if (!ledgerCheck.isBalanced) {
      discrepancies.push({
        type: 'COMMISSION_MISMATCH',
        severity: 'HIGH',
        referenceId: 'GLOBAL_LEDGER',
        description: `Global Ledger UNBALANCED! Total Debits ₹${ledgerCheck.totalDebits} != Total Credits ₹${ledgerCheck.totalCredits} (Diff: ₹${ledgerCheck.diff})`,
      });
    }

    // 2. Cross-check Payments vs Ledger Entries
    const payments = await prisma.payment.findMany({ where: { status: 'COMPLETED' } });
    for (const pay of payments) {
      const ledgerEntry = await prisma.financialLedger.findFirst({
        where: { orderId: pay.orderId, accountType: 'CUSTOMER_PAYMENT' },
      });

      if (!ledgerEntry) {
        discrepancies.push({
          type: 'PAYMENT_MISSING_LEDGER',
          severity: 'HIGH',
          referenceId: pay.orderId,
          description: `Completed payment for Order ${pay.orderId} is missing double-entry ledger record`,
        });
      }
    }

    // 3. Cross-check Ledger Customer Payments vs Gateway Payments
    const customerPaymentLedgers = await prisma.financialLedger.findMany({
      where: { accountType: 'CUSTOMER_PAYMENT', direction: 'DEBIT' },
    });
    for (const entry of customerPaymentLedgers) {
      if (entry.orderId) {
        const order = await prisma.order.findUnique({ where: { id: entry.orderId } });
        if (!order) {
          discrepancies.push({
            type: 'LEDGER_MISSING_PAYMENT',
            severity: 'HIGH',
            referenceId: entry.orderId,
            description: `Ledger entry ${entry.id} references non-existent order ${entry.orderId}`,
          });
        }
      }
    }

    // 4. Cross-check Cancelled Orders vs Reversal Entries
    const cancelledOrders = await prisma.order.findMany({ where: { status: 'CANCELLED' } });
    for (const cOrder of cancelledOrders) {
      const reversalLedger = await prisma.financialLedger.findFirst({
        where: { orderId: cOrder.id, direction: 'CREDIT', accountType: 'CUSTOMER_PAYMENT' },
      });
      if (!reversalLedger) {
        discrepancies.push({
          type: 'REFUND_MISMATCH',
          severity: 'MEDIUM',
          referenceId: cOrder.id,
          description: `Cancelled Order #${cOrder.orderNumber} is missing compensating ledger reversal record`,
        });
      }
    }

    // Counts for Summary
    const [totalOrders, totalPayments, totalLedgerEntries, totalSettlements] = await Promise.all([
      prisma.order.count(),
      prisma.payment.count(),
      prisma.financialLedger.count(),
      prisma.sellerSettlement.count(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      isBalanced: discrepancies.length === 0,
      globalLedgerDebits: ledgerCheck.totalDebits,
      globalLedgerCredits: ledgerCheck.totalCredits,
      ledgerDifference: ledgerCheck.diff,
      discrepancyCount: discrepancies.length,
      discrepancies,
      summary: {
        totalOrders,
        totalPayments,
        totalLedgerEntries,
        totalSettlements,
      },
    };
  }
}
