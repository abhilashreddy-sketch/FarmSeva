import { z } from 'zod';
import { UserRole, UserStatus } from '@farm-seva/shared';
import {
  normalizeIndianPhone,
  normalizeEmail,
  normalizeLoginIdentifier,
} from '../utils/identity-utils';

export const phoneZod = z.string().transform((val, ctx) => {
  try {
    return normalizeIndianPhone(val);
  } catch (err: any) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: err.message || 'Invalid Indian mobile number format (must be 10 digits starting with 6-9)',
    });
    return z.NEVER;
  }
});

export const emailZod = z
  .string()
  .optional()
  .nullable()
  .transform((val, ctx) => {
    if (!val || typeof val !== 'string' || !val.trim()) return undefined;
    const normalized = normalizeEmail(val);
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid email address',
      });
      return z.NEVER;
    }
    return normalized;
  });

export const registerFarmerSchema = z.object({
  phone: phoneZod,
  email: emailZod,
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredLanguage: z.enum(['en', 'te', 'kn', 'hi', 'ta', 'mr']).default('en'),
  experienceYears: z.number().int().nonnegative().optional(),
  totalLandAcres: z.number().positive().optional(),
  primaryWaterSource: z.string().optional(),
});

export const registerSellerSchema = z.object({
  phone: phoneZod,
  email: emailZod,
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredLanguage: z.enum(['en', 'te', 'kn', 'hi', 'ta', 'mr']).default('en'),
  businessName: z.string().min(3, 'Business name must be at least 3 characters').trim(),
  pesticideLicenseNo: z.string().min(3, 'Pesticide license number is required').trim(),
  fertilizerLicenseNo: z.string().optional(),
  shopName: z.string().min(3, 'Shop name is required').trim(),
  addressLine: z.string().min(5, 'Shop address line is required').trim(),
  villageLandmark: z.string().optional(),
  taluk: z.string().min(2, 'Taluk is required').trim(),
  district: z.string().min(2, 'District is required').trim(),
  state: z.string().min(2, 'State is required').trim(),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid 6-digit pincode'),
  contactPhone: phoneZod,
});

export const registerExpertSchema = z.object({
  phone: phoneZod,
  email: emailZod,
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredLanguage: z.enum(['en', 'te', 'kn', 'hi', 'ta', 'mr']).default('en'),
  specialization: z.string().min(3, 'Specialization is required').trim(),
  qualification: z.string().min(2, 'Qualification is required').trim(),
  certificationNo: z.string().optional(),
  yearsExperience: z.number().int().nonnegative(),
});

export const registerDeliverySchema = z.object({
  phone: phoneZod,
  email: emailZod,
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredLanguage: z.enum(['en', 'te', 'kn', 'hi', 'ta', 'mr']).default('en'),
  vehicleType: z.string().min(2, 'Vehicle type is required (e.g., Motorcycle, Auto, Pickup)').trim(),
  vehicleNumber: z.string().min(4, 'Vehicle registration number is required').trim(),
  activeDistrict: z.string().min(2, 'Active district is required').trim(),
});

export const createCallCenterAgentSchema = z.object({
  phone: phoneZod,
  email: emailZod,
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  agentCode: z.string().min(3, 'Agent code is required (e.g. AGT-101)').trim(),
  department: z.string().default('FARMER_SUPPORT'),
  deskPhone: z.string().optional(),
});

export const loginSchema = z.object({
  phone: z.string().min(3, 'Phone number or email is required').transform((val, ctx) => {
    try {
      const res = normalizeLoginIdentifier(val);
      return res.normalized;
    } catch (err: any) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err.message || 'Invalid phone number or email format',
      });
      return z.NEVER;
    }
  }),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  phone: phoneZod,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
  reason: z.string().optional(),
});

export const requestPhoneLinkOtpSchema = z.object({
  phone: phoneZod,
});

export const linkPhoneSchema = z.object({
  phone: phoneZod,
  otp: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit number'),
});

export const setPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
