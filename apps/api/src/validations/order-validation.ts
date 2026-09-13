import { z } from 'zod';

export const checkoutSchema = z.object({
  addressId: z.string().min(1, 'Delivery address is required'),
  paymentMethod: z.enum(['COD', 'ONLINE']).default('COD'),
  idempotencyKey: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'DRAFT',
    'PENDING_ACCEPTANCE',
    'ACCEPTED',
    'PACKING',
    'DISPATCHED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REJECTED',
  ]),
  cancellationReason: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const updateDeliveryStatusSchema = z.object({
  status: z.enum(['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED_ATTEMPT']),
  deliveryOtp: z.string().optional(),
  notes: z.string().optional(),
});

export const assignDeliverySchema = z.object({
  deliveryPartnerId: z.string().min(1, 'Delivery partner ID is required'),
});
