import { z } from 'zod';
import { UserRole, UserStatus } from '@farm-seva/shared';

const phoneRegex = /^[6-9]\d{9}$/;

export const registerFarmerSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Invalid Indian mobile number format (must be 10 digits starting with 6-9)'),
  email: z.string().email('Invalid email address').optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredLanguage: z.enum(['en', 'te', 'kn', 'hi', 'ta', 'mr']).default('en'),
  experienceYears: z.number().int().nonnegative().optional(),
  totalLandAcres: z.number().positive().optional(),
  primaryWaterSource: z.string().optional(),
});

export const registerSellerSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Invalid Indian mobile number format'),
  email: z.string().email('Invalid email address').optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredLanguage: z.enum(['en', 'te', 'kn', 'hi', 'ta', 'mr']).default('en'),
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  pesticideLicenseNo: z.string().min(3, 'Pesticide license number is required'),
  fertilizerLicenseNo: z.string().optional(),
  shopName: z.string().min(3, 'Shop name is required'),
  addressLine: z.string().min(5, 'Shop address line is required'),
  villageLandmark: z.string().optional(),
  taluk: z.string().min(2, 'Taluk is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid 6-digit pincode'),
  contactPhone: z.string().regex(phoneRegex, 'Invalid contact phone number'),
});

export const registerExpertSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Invalid Indian mobile number format'),
  email: z.string().email('Invalid email address').optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredLanguage: z.enum(['en', 'te', 'kn', 'hi', 'ta', 'mr']).default('en'),
  specialization: z.string().min(3, 'Specialization is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  certificationNo: z.string().optional(),
  yearsExperience: z.number().int().nonnegative(),
});

export const registerDeliverySchema = z.object({
  phone: z.string().regex(phoneRegex, 'Invalid Indian mobile number format'),
  email: z.string().email('Invalid email address').optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredLanguage: z.enum(['en', 'te', 'kn', 'hi', 'ta', 'mr']).default('en'),
  vehicleType: z.string().min(2, 'Vehicle type is required (e.g., Motorcycle, Auto, Pickup)'),
  vehicleNumber: z.string().min(4, 'Vehicle registration number is required'),
  activeDistrict: z.string().min(2, 'Active district is required'),
});

export const createCallCenterAgentSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Invalid Indian mobile number format'),
  email: z.string().email('Invalid email address').optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  agentCode: z.string().min(3, 'Agent code is required (e.g. AGT-101)'),
  department: z.string().default('FARMER_SUPPORT'),
  deskPhone: z.string().optional(),
});

export const loginSchema = z.object({
  phone: z.string().min(5, 'Phone number or ID is required'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Invalid Indian mobile number format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
  reason: z.string().optional(),
});
