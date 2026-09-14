import dotenv from 'dotenv';
import path from 'path';

// Load .env file from root directory if present
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'farm-seva-dev-secret-key-change-in-production-min-32-chars-long';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'farm-seva-refresh-secret-key-change-in-production';
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'farm-seva-default-32-byte-secret-key-prod!!';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.dyzcxyrbfdkhmxudqehf:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const DIRECT_URL = process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://postgres.dyzcxyrbfdkhmxudqehf:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dyzcxyrbfdkhmxudqehf.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CORS_ORIGINS = process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,https://farm-seva-web.vercel.app';

// Strict Startup Validation for Production
if (NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || JWT_SECRET.includes('dev-secret-key')) {
    throw new Error('FATAL SECURITY ERROR: Insecure JWT_SECRET specified in production environment');
  }
  if (!process.env.REFRESH_TOKEN_SECRET || REFRESH_TOKEN_SECRET.includes('refresh-secret-key')) {
    throw new Error('FATAL SECURITY ERROR: Insecure REFRESH_TOKEN_SECRET specified in production environment');
  }
  if (!process.env.ENCRYPTION_SECRET || ENCRYPTION_SECRET.includes('default-32-byte-secret')) {
    throw new Error('FATAL SECURITY ERROR: Production ENCRYPTION_SECRET must be configured via a secrets manager');
  }
  if (ENCRYPTION_SECRET.length < 32) {
    throw new Error('FATAL SECURITY ERROR: Production ENCRYPTION_SECRET must be at least 32 bytes long');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('FATAL CONFIGURATION ERROR: Mandatory DATABASE_URL missing in production environment');
  }
}

export const env = {
  NODE_ENV,
  PORT: parseInt(process.env.PORT || '4000', 10),
  JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  ENCRYPTION_SECRET,
  DATABASE_URL,
  DIRECT_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  REDIS_URL,
  CORS_ORIGINS: CORS_ORIGINS.split(','),
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  PILOT_MODE: process.env.PILOT_MODE === 'true' || true,
  PILOT_SUPPORTED_STATES: process.env.PILOT_SUPPORTED_STATES
    ? process.env.PILOT_SUPPORTED_STATES.split(',')
    : ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra', 'Tamil Nadu'],
  
  // Storage & External Provider Mode Flags
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'LOCAL', // S3, R2, LOCAL, SUPABASE_STORAGE
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || '',
  S3_REGION: process.env.S3_REGION || 'ap-south-1',
  
  // Honest Provider Connectivity Modes
  RAZORPAY_MODE: process.env.RAZORPAY_KEY_ID ? 'CONFIGURED' : 'DEMO',
  SMS_PROVIDER_MODE: process.env.SMS_API_KEY || process.env.SMS_PROVIDER_KEY ? 'CONFIGURED' : 'DEMO',
  WHATSAPP_PROVIDER_MODE: process.env.WHATSAPP_API_TOKEN ? 'CONFIGURED' : 'DEMO',
  IVR_PROVIDER_MODE: process.env.IVR_API_KEY ? 'CONFIGURED' : 'DEMO',
  PUSH_PROVIDER_MODE: process.env.FCM_SERVER_KEY ? 'CONFIGURED' : 'DEMO',
  PAYOUT_PROVIDER_MODE: process.env.PAYOUT_API_KEY ? 'CONFIGURED' : 'DEMO',
  KYC_PROVIDER_MODE: process.env.KYC_PROVIDER_KEY ? 'CONFIGURED' : 'DEMO',
};
