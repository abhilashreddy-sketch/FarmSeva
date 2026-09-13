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
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'కన్నడ / ಕನ್ನಡ' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
] as const;

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

