import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/error-middleware';
import { logAuditEvent } from '../utils/audit-logger';
import { env } from '../config/env';

const prisma = new PrismaClient();

export interface PaymentOrderResult {
  success: boolean;
  provider: string;
  razorpayOrderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  status: 'CREATED' | 'FAILED' | 'NOT_CONFIGURED';
  error?: string;
}

export class RazorpayPaymentProvider {
  private keyId = env.RAZORPAY_KEY_ID;
  private keySecret = env.RAZORPAY_KEY_SECRET;

  isConfigured(): boolean {
    return !!this.keyId && !!this.keySecret;
  }

  async createPaymentOrder(params: { orderId: string; amount: number; currency: string }): Promise<PaymentOrderResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: 'RAZORPAY (NOT_CONFIGURED)',
        status: 'NOT_CONFIGURED',
        error: 'Razorpay API credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) missing on server',
      };
    }

    try {
      const amountInPaise = Math.round(params.amount * 100);
      const url = 'https://api.razorpay.com/v1/orders';
      const authHeader = 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: params.currency || 'INR',
          receipt: params.orderId,
          notes: {
            orderId: params.orderId,
            platform: 'FARM_SEVA',
          },
        }),
      });

      const data: any = await response.json();

      if (!response.ok || data.error) {
        const errorMsg = data.error?.description || data.message || `HTTP ${response.status} from Razorpay`;
        return {
          success: false,
          provider: 'RAZORPAY',
          status: 'FAILED',
          error: errorMsg,
        };
      }

      return {
        success: true,
        provider: 'RAZORPAY',
        razorpayOrderId: data.id,
        amount: data.amount,
        currency: data.currency,
        keyId: this.keyId,
        status: 'CREATED',
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'RAZORPAY',
        status: 'FAILED',
        error: err.message || 'Network error communicating with Razorpay API',
      };
    }
  }

  verifyPaymentSignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): boolean {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const hmac = crypto.createHmac('sha256', this.keySecret);
      hmac.update(params.razorpayOrderId + '|' + params.razorpayPaymentId);
      const generatedSignature = hmac.digest('hex');

      const a = Buffer.from(generatedSignature, 'utf8');
      const b = Buffer.from(params.razorpaySignature, 'utf8');

      if (a.length !== b.length) {
        return false;
      }
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
}

export class PaymentService {
  private static razorpayProvider = new RazorpayPaymentProvider();

  /**
   * Create Razorpay Payment Order for an existing pending Order.
   */
  static async createPaymentOrderForOrder(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { farmer: true, payments: true },
    });

    if (!order) {
      throw new ApiError('ORDER_NOT_FOUND', 'Order not found', 404);
    }

    if (order.farmer.userId !== userId) {
      throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Order does not belong to farmer', 403);
    }

    const netAmount = Number(order.netAmount);

    const result = await this.razorpayProvider.createPaymentOrder({
      orderId: order.id,
      amount: netAmount,
      currency: 'INR',
    });

    if (!result.success) {
      throw new ApiError('PAYMENT_PROVIDER_ERROR', result.error || 'Razorpay order creation failed', 400);
    }

    // Associate Razorpay Order ID with Payment record
    const payment = order.payments[0];
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayOrderId: result.razorpayOrderId,
          status: 'PENDING',
        },
      });
    }

    return {
      orderId: order.id,
      razorpayOrderId: result.razorpayOrderId,
      amount: result.amount,
      currency: result.currency,
      keyId: result.keyId,
    };
  }

  /**
   * Verify Razorpay Payment Signature and mark Order & Payment as PAID / COMPLETED.
   */
  static async verifyAndProcessOnlinePayment(userId: string, params: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    if (!this.razorpayProvider.isConfigured()) {
      throw new ApiError('PAYMENT_PROVIDER_NOT_CONFIGURED', 'Razorpay API credentials are not configured on server', 400);
    }

    const isValid = this.razorpayProvider.verifyPaymentSignature({
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      razorpaySignature: params.razorpaySignature,
    });

    if (!isValid) {
      throw new ApiError('PAYMENT_VERIFICATION_FAILED', 'Invalid Razorpay payment signature', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: { farmer: true, payments: true },
    });

    if (!order) {
      throw new ApiError('ORDER_NOT_FOUND', 'Order not found', 404);
    }

    if (order.farmer.userId !== userId) {
      throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Order does not belong to farmer', 403);
    }

    // Idempotent Payment Completion
    if (order.payments.length > 0) {
      const existingPayment = order.payments[0];
      if (existingPayment.status !== 'PAID' && existingPayment.status !== 'COMPLETED') {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: 'PAID',
            transactionId: params.razorpayPaymentId,
            razorpayOrderId: params.razorpayOrderId,
            razorpayPaymentId: params.razorpayPaymentId,
            razorpaySignature: params.razorpaySignature,
            paidAt: new Date(),
            rawResponse: JSON.stringify({
              razorpayOrderId: params.razorpayOrderId,
              razorpayPaymentId: params.razorpayPaymentId,
            }),
          },
        });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.orderId },
      data: {
        paymentStatus: 'PAID',
        status: order.status === 'DRAFT' ? 'PENDING_ACCEPTANCE' : order.status,
      },
      include: {
        items: true,
        shop: true,
        payments: true,
        delivery: true,
      },
    });

    await logAuditEvent({
      userId,
      action: 'PAYMENT_VERIFIED_SUCCESS',
      entityName: 'Order',
      entityId: params.orderId,
      changesJson: JSON.stringify({ razorpayPaymentId: params.razorpayPaymentId, razorpayOrderId: params.razorpayOrderId }),
    });

    return updatedOrder;
  }

  /**
   * Process Razorpay Webhook Event with HMAC-SHA256 Signature Verification.
   */
  static async processWebhook(rawBody: string, signature: string) {
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new ApiError('WEBHOOK_SECRET_MISSING', 'RAZORPAY_WEBHOOK_SECRET is not configured on server', 400);
    }

    if (!signature) {
      throw new ApiError('WEBHOOK_SIGNATURE_MISSING', 'x-razorpay-signature header missing', 400);
    }

    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(rawBody);
    const expectedSig = hmac.digest('hex');

    try {
      const a = Buffer.from(expectedSig, 'utf8');
      const b = Buffer.from(signature, 'utf8');

      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        throw new ApiError('WEBHOOK_SIGNATURE_FAILED', 'Invalid Razorpay webhook signature', 400);
      }
    } catch {
      throw new ApiError('WEBHOOK_SIGNATURE_FAILED', 'Invalid Razorpay webhook signature', 400);
    }

    // Parse Event Payload
    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (event === 'payment.captured' || event === 'order.paid') {
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const paymentRecord = await prisma.payment.findFirst({
          where: { razorpayOrderId },
        });

        if (paymentRecord && paymentRecord.status !== 'PAID') {
          await prisma.payment.update({
            where: { id: paymentRecord.id },
            data: {
              status: 'PAID',
              razorpayPaymentId,
              paidAt: new Date(),
              rawResponse: JSON.stringify(payload),
            },
          });

          await prisma.order.update({
            where: { id: paymentRecord.orderId },
            data: { paymentStatus: 'PAID' },
          });
        }
      }
    }

    return { success: true, event };
  }
}
