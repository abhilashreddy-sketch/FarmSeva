import { PrismaClient, Prisma } from '@prisma/client';
import { LedgerService } from './ledger-service';
import { ApiError } from '../../middleware/error-middleware';

const prisma = new PrismaClient();

export interface ProcessRefundOptions {
  orderId: string;
  reason: string;
  idempotencyKey: string;
  refundAmount?: number;
}

export class RefundService {
  /**
   * Processes order cancellation or refund with append-only double-entry reversal.
   * ENFORCES IDEMPOTENCY: Repeated requests with same idempotencyKey return existing reversal safely.
   * ENFORCES REVERSAL INVARIANT: DEBIT = CREDIT for compensating journal entries.
   */
  static async processOrderRefund(options: ProcessRefundOptions): Promise<any> {
    const { orderId, reason, idempotencyKey, refundAmount } = options;

    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { shop: true, items: true, payments: true },
      });

      if (!order) {
        throw new ApiError('ORDER_NOT_FOUND', `Order ${orderId} not found for refund`, 404);
      }

      // Check if refund reversal already executed for this idempotencyKey
      const existingLedger = await tx.financialLedger.findFirst({
        where: { idempotencyKey },
      });
      if (existingLedger) {
        return { success: true, isDuplicate: true, orderStatus: order.status };
      }

      const commission = await tx.sellerCommission.findUnique({
        where: { orderId },
      });

      const grossAmount = refundAmount || Number(order.totalItemsPrice);
      const sellerId = order.shop.sellerId;
      const commissionDeduction = commission ? Number(commission.commissionAmount) + Number(commission.fixedFeeAmount) : 0;
      const netSellerPayable = commission ? Number(commission.netSellerAmount) : grossAmount;

      // Update Order & Payment statuses
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
        },
      });

      await tx.payment.updateMany({
        where: { orderId },
        data: { status: 'REFUNDED' },
      });

      if (commission) {
        await tx.sellerCommission.update({
          where: { orderId },
          data: { status: 'REVERSED' },
        });
      }

      // Create Compensating Double-Entry Reversal Entries
      // 1. Reverse Customer Payment (CREDIT Customer Payment, DEBIT Seller Payable)
      // 2. Reverse Platform Commission (DEBIT Platform Commission, CREDIT Seller Payable)
      const transactionId = `TX_REFUND_${order.orderNumber}`;

      await LedgerService.recordDoubleEntry(
        {
          transactionId,
          idempotencyKey,
          entries: [
            {
              accountType: 'CUSTOMER_PAYMENT',
              direction: 'CREDIT',
              amount: grossAmount,
              orderId,
              sellerId,
              description: `Refund reversal issued for Order #${order.orderNumber} (Reason: ${reason})`,
            },
            {
              accountType: 'SELLER_PAYABLE',
              direction: 'DEBIT',
              amount: grossAmount,
              orderId,
              sellerId,
              description: `Gross sales debit reversal for Order #${order.orderNumber}`,
            },
            {
              accountType: 'PLATFORM_COMMISSION',
              direction: 'DEBIT',
              amount: commissionDeduction,
              orderId,
              sellerId,
              description: `Platform commission refund reversal for Order #${order.orderNumber}`,
            },
            {
              accountType: 'SELLER_PAYABLE',
              direction: 'CREDIT',
              amount: commissionDeduction,
              orderId,
              sellerId,
              description: `Seller account credit for reversed commission on Order #${order.orderNumber}`,
            },
          ],
        },
        tx
      );

      // Revert Referral Reward if qualifying order was refunded
      const referral = await tx.referral.findFirst({
        where: { qualifyingOrderId: orderId },
      });
      if (referral && referral.status === 'REWARD_GRANTED') {
        await tx.referral.update({
          where: { id: referral.id },
          data: {
            status: 'REVERSED',
            reversedAt: new Date(),
          },
        });
      }

      // Restock Product Variant Inventory
      for (const item of order.items) {
        if (item.productId) {
          await tx.productVariant.updateMany({
            where: { productId: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
      }

      return {
        success: true,
        orderId,
        refundAmount: grossAmount,
        commissionReversed: commissionDeduction,
        status: 'CANCELLED',
      };
    });
  }
}
