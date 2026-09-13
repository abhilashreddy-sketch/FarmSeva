import { z } from 'zod';

export const createMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  isInternalNote: z.boolean().optional().default(false),
});

export const submitGuidanceSchema = z.object({
  guidanceText: z.string().min(10, 'Guidance text must be at least 10 characters long').max(4000),
  visibility: z.enum(['FARMER_VISIBLE', 'INTERNAL']).optional().default('FARMER_VISIBLE'),
  referencedProductId: z.string().uuid().optional(),
});

export const updateConsultationStatusSchema = z.object({
  status: z.enum([
    'REQUESTED',
    'ASSIGNED',
    'ACTIVE',
    'WAITING_FOR_FARMER',
    'WAITING_FOR_EXPERT',
    'COMPLETED',
    'CANCELLED',
  ]),
});
