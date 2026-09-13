import { z } from 'zod';

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
