import { PrismaClient } from '@prisma/client';
import { LedgerService } from './financial/ledger-service';
import { EncryptionService } from './financial/encryption-service';

const prisma = new PrismaClient();

export class SellerAnalyticsService {
  /**
   * Fetches seller sales analytics, authoritative ledger earnings, and payout status.
   */
  static async getSellerDashboardAnalytics(sellerUserId: string): Promise<any> {
    const seller = await prisma.seller.findUnique({
      where: { userId: sellerUserId },
      include: { shops: true, user: true },
    });

    if (!seller) {
      throw new Error('Seller profile not found for user');
    }

    const shopIds = seller.shops.map((s) => s.id);

    // Compute Authoritative Ledger Earnings
    const ledgerStats = await LedgerService.getAuthoritativeSellerBalance(seller.id);

    // Order Counts
    const [totalOrders, pendingOrders, completedOrders, cancelledOrders] = await Promise.all([
      prisma.order.count({ where: { shopId: { in: shopIds } } }),
      prisma.order.count({ where: { shopId: { in: shopIds }, status: { in: ['PENDING_ACCEPTANCE', 'ACCEPTED', 'PACKING', 'DISPATCHED'] } } }),
      prisma.order.count({ where: { shopId: { in: shopIds }, status: 'DELIVERED' } }),
      prisma.order.count({ where: { shopId: { in: shopIds }, status: 'CANCELLED' } }),
    ]);

    // Inventory Stock Alerts
    const listings = await prisma.sellerListing.findMany({
      where: { sellerId: seller.id },
      include: { product: true, variant: true },
    });

    const lowStockItems = listings.filter((l) => l.quantityAvailable > 0 && l.quantityAvailable <= 5);
    const outOfStockItems = listings.filter((l) => l.quantityAvailable === 0);

    // Settlements Summary
    const settlements = await prisma.sellerSettlement.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
    });

    const pendingSettlementAmount = settlements
      .filter((s) => s.status === 'PENDING')
      .reduce((sum, s) => sum + Number(s.totalNetPayout), 0);

    const completedSettlementAmount = settlements
      .filter((s) => s.status === 'PAID' || s.status === 'DEMO')
      .reduce((sum, s) => sum + Number(s.totalNetPayout), 0);

    // Masked Payout Credentials
    const maskedAccount = EncryptionService.maskBankAccount(seller.bankAccountNumber);
    const maskedIfsc = EncryptionService.maskIfscCode(seller.bankIfscCode);

    return {
      businessName: seller.businessName,
      verificationStatus: seller.verificationStatus,
      payoutAccountMasked: maskedAccount,
      ifscMasked: maskedIfsc,
      metrics: {
        grossSalesGMV: ledgerStats.grossPayable,
        platformCommission: ledgerStats.totalDebits,
        netSellerEarnings: ledgerStats.authoritativeBalance,
        pendingSettlementAmount,
        completedSettlementAmount,
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
      },
      lowStockListings: lowStockItems.map((l) => ({
        id: l.id,
        productName: l.product.name,
        quantityAvailable: l.quantityAvailable,
        sellingPrice: Number(l.sellingPrice),
      })),
      settlements: settlements.map((s) => ({
        id: s.id,
        settlementRef: s.settlementRef,
        totalGross: Number(s.totalGross),
        totalCommission: Number(s.totalCommission),
        totalNetPayout: Number(s.totalNetPayout),
        status: s.status,
        eligibleAt: s.eligibleAt,
        demoBadge: 'DEMO — NO REAL MONEY TRANSFERRED',
      })),
    };
  }
}
