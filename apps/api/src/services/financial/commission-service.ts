import { PrismaClient, Prisma } from '@prisma/client';
import { LedgerService } from './ledger-service';
import { ApiError } from '../../middleware/error-middleware';

const prisma = new PrismaClient();

export class CommissionService {
  /**
   * Reads or initializes configurable BusinessSetting from database.
   */
  static async getBusinessSettings(txPrisma?: Prisma.TransactionClient): Promise<{
    platformCommissionPercent: number;
    fixedTransactionFee: number;
    deliveryFeeDefault: number;
    minOrderValueForFreeDelivery: number;
    sellerSettlementDays: number;
    cancellationWindowHours: number;
  }> {
    const client = txPrisma || prisma;
    let settings = await client.businessSetting.findUnique({ where: { id: 'default' } });

    if (!settings) {
      settings = await client.businessSetting.create({
        data: {
          id: 'default',
          platformCommissionPercent: new Prisma.Decimal(5.0),
          fixedTransactionFee: new Prisma.Decimal(10.0),
          deliveryFeeDefault: new Prisma.Decimal(50.0),
          minOrderValueForFreeDelivery: new Prisma.Decimal(1000.0),
          sellerSettlementDays: 7,
          cancellationWindowHours: 24,
        },
      });
    }

    return {
      platformCommissionPercent: Number(settings.platformCommissionPercent),
      fixedTransactionFee: Number(settings.fixedTransactionFee),
      deliveryFeeDefault: Number(settings.deliveryFeeDefault),
      minOrderValueForFreeDelivery: Number(settings.minOrderValueForFreeDelivery),
      sellerSettlementDays: settings.sellerSettlementDays,
      cancellationWindowHours: settings.cancellationWindowHours,
    };
  }

  /**
   * Calculates order commission and records double-entry ledger entries.
   * Executed atomically inside transaction.
   */
  static async calculateAndRecordOrderCommission(
    orderId: string,
    txPrisma?: Prisma.TransactionClient
  ): Promise<any> {
    const client = txPrisma || prisma;

    const order = await client.order.findUnique({
      where: { id: orderId },
      include: { shop: true },
    });

    if (!order) {
      throw new ApiError('ORDER_NOT_FOUND', `Order ${orderId} not found for commission calculation`, 404);
    }

    const sellerId = order.shop.sellerId;
    const grossAmount = Number(order.totalItemsPrice);

    // Check if commission already recorded
    const existingCommission = await client.sellerCommission.findUnique({
      where: { orderId },
    });
    if (existingCommission) {
      return existingCommission;
    }

    const settings = await CommissionService.getBusinessSettings(client);
    const commPercent = settings.platformCommissionPercent;
    const fixedFee = settings.fixedTransactionFee;

    const commissionAmount = Math.round(((grossAmount * commPercent) / 100) * 100) / 100;
    const totalDeductions = Math.min(grossAmount, commissionAmount + fixedFee);
    const netSellerAmount = Math.max(0, Math.round((grossAmount - totalDeductions) * 100) / 100);

    // Record SellerCommission breakdown
    const commissionRecord = await client.sellerCommission.create({
      data: {
        orderId,
        sellerId,
        grossAmount: new Prisma.Decimal(grossAmount),
        commissionPercent: new Prisma.Decimal(commPercent),
        commissionAmount: new Prisma.Decimal(commissionAmount),
        fixedFeeAmount: new Prisma.Decimal(fixedFee),
        netSellerAmount: new Prisma.Decimal(netSellerAmount),
        status: 'PENDING',
      },
    });

    // Record Double-Entry Journal Entries
    // 1. Customer Payment -> Seller Payable (CREDIT Seller Payable, DEBIT Customer Payment)
    // 2. Seller Payable -> Platform Commission (DEBIT Seller Payable, CREDIT Platform Commission)
    const transactionId = `TX_ORD_${order.orderNumber}`;
    const idempotencyKey = `IDEM_ORD_COMM_${orderId}`;

    await LedgerService.recordDoubleEntry(
      {
        transactionId,
        idempotencyKey,
        entries: [
          {
            accountType: 'CUSTOMER_PAYMENT',
            direction: 'DEBIT',
            amount: grossAmount,
            orderId,
            sellerId,
            description: `Customer payment received for Order #${order.orderNumber}`,
          },
          {
            accountType: 'SELLER_PAYABLE',
            direction: 'CREDIT',
            amount: grossAmount,
            orderId,
            sellerId,
            description: `Gross sales credit for Order #${order.orderNumber}`,
          },
          {
            accountType: 'SELLER_PAYABLE',
            direction: 'DEBIT',
            amount: totalDeductions,
            orderId,
            sellerId,
            description: `Platform commission (${commPercent}%) & fixed fee deduction for Order #${order.orderNumber}`,
          },
          {
            accountType: 'PLATFORM_COMMISSION',
            direction: 'CREDIT',
            amount: totalDeductions,
            orderId,
            sellerId,
            description: `Platform revenue earned from Order #${order.orderNumber}`,
          },
        ],
      },
      client
    );

    return commissionRecord;
  }
}
