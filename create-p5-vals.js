const fs = require('fs');
const path = require('path');

const addrVal = `import { z } from 'zod';

export const createAddressSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name must be at least 2 characters'),
  phone: z.string().min(10, 'Valid 10-digit mobile number required'),
  houseNo: z.string().min(1, 'House / Door number is required'),
  streetLandmark: z.string().min(2, 'Street or landmark is required'),
  villageTaluk: z.string().min(2, 'Village / Taluk is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().length(6, 'Pincode must be exactly 6 digits'),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();
`;

const orderVal = `import { z } from 'zod';

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
`;

const paymentVal = `import { z } from 'zod';

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
});
`;

fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'validations', 'address-validation.ts'), addrVal, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'validations', 'order-validation.ts'), orderVal, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'validations', 'payment-validation.ts'), paymentVal, 'utf8');
console.log('Created Phase 5 validation schemas.');
