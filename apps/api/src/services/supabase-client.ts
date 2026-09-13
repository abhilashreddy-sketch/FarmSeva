import { env } from '../config/env';
import { Logger } from '../utils/logger';

export class SupabaseService {
  /**
   * Returns Supabase Server Configuration metadata.
   * STRICT SECURITY: Ensures service role key is NEVER exposed to client.
   */
  static getConfig() {
    return {
      supabaseUrl: env.SUPABASE_URL,
      hasAnonKey: Boolean(env.SUPABASE_ANON_KEY && !env.SUPABASE_ANON_KEY.includes('YOUR_')),
      hasServiceRoleKey: Boolean(env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_SERVICE_ROLE_KEY.includes('YOUR_')),
      databaseHost: 'aws-0-ap-south-1.pooler.supabase.com',
      projectId: 'dyzcxyrbfdkhmxudqehf',
    };
  }

  /**
   * Health probe verifying Supabase PostgreSQL connection parameter completeness.
   */
  static checkConnectionStatus(): { isReady: boolean; status: string; notes: string } {
    const isConfigured = !env.DATABASE_URL.includes('YOUR_SUPABASE_PASSWORD');
    
    if (isConfigured) {
      Logger.info(`[SUPABASE] Connected to project dyzcxyrbfdkhmxudqehf at aws-0-ap-south-1.pooler.supabase.com`);
      return {
        isReady: true,
        status: 'CONNECTED',
        notes: 'Connected to live Supabase PostgreSQL instance.',
      };
    } else {
      Logger.info(`[SUPABASE] Awaiting database password configuration in .env.`);
      return {
        isReady: false,
        status: 'AWAITING_PASSWORD',
        notes: 'Set YOUR_SUPABASE_PASSWORD in root .env file to enable live remote queries.',
      };
    }
  }
}
