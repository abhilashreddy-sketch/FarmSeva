export * from './state-machines/order-state-machine';
export * from './state-machines/crop-problem-state-machine';
export * from './state-machines/consultation-state-machine';

export enum UserRole {
  FARMER = 'FARMER',
  SELLER = 'SELLER',
  AGRICULTURAL_EXPERT = 'AGRICULTURAL_EXPERT',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  CALL_CENTER_AGENT = 'CALL_CENTER_AGENT',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
  REJECTED = 'REJECTED',
}

export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', nativeName: 'English', ttsCode: 'en-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', ttsCode: 'te-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', ttsCode: 'hi-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', ttsCode: 'kn-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', ttsCode: 'ta-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', ttsCode: 'ml-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', ttsCode: 'mr-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', ttsCode: 'bn-IN' },
] as const;

export type SupportedLanguageCode = typeof SUPPORTED_LOCALES[number]['code'];

export const REGULATORY_COMPLIANCE_RULES = {
  SAFETY_DISCLAIMER_TEXT:
    'Regulatory Safety Notice: Agricultural products must be used strictly according to Central Insecticides Board (CIB) / manufacturer approved label guidelines. Farm Seva provides informational data only. Chemical applications should follow advice from certified agricultural experts.',
  MAX_ACTIVE_INGREDIENT_CONCENTRATION_ALERT_THRESHOLD: 50.0,
  REQUIRES_PRESCRIPTION_CHECK_FOR_RED_TRIANGLE: true,
} as const;

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  PUSH = 'PUSH',
  IVR = 'IVR',
}

export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  DELIVERY_UPDATE = 'DELIVERY_UPDATE',
  CONSULTATION_UPDATE = 'CONSULTATION_UPDATE',
  CROP_ADVISORY = 'CROP_ADVISORY',
  SYSTEM = 'SYSTEM',
  EMERGENCY_BROADCAST = 'EMERGENCY_BROADCAST',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface NotificationTemplatePayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
  channels?: NotificationChannel[];
}

/**
 * Centralized Indian phone normalization for canonical 10-digit format.
 */
export function normalizeIndianPhone(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Please enter a valid 10-digit Indian mobile number');
  }
  const cleaned = input.trim().replace(/[\s\-\(\)\+]/g, '');
  let tenDigit = cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    tenDigit = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    tenDigit = cleaned.slice(1);
  }
  if (!/^[6-9]\d{9}$/.test(tenDigit)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9');
  }
  return tenDigit;
}

/**
 * Centralized email normalization.
 */
export function normalizeEmail(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

