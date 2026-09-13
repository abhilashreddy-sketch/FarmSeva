import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  smsEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  language: z.enum(['en', 'te', 'kn', 'hi', 'ta', 'mr']).optional(),
});

export const registerDeviceTokenSchema = z.object({
  deviceToken: z.string().min(5, 'Device token is required'),
  platform: z.enum(['ANDROID', 'IOS', 'WEB']).optional(),
});

export const emergencyBroadcastSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
  targetState: z.string().optional(),
  targetDistrict: z.string().optional(),
  targetCrop: z.string().optional(),
  targetLanguage: z.enum(['en', 'te', 'kn', 'hi', 'ta', 'mr']).optional(),
  channels: z.array(z.enum(['IN_APP', 'SMS', 'WHATSAPP', 'PUSH', 'IVR'])).min(1, 'At least one channel is required'),
});

export const webhookPayloadSchema = z.object({
  providerMessageId: z.string().min(1),
  status: z.enum(['DELIVERED', 'FAILED']),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
});
