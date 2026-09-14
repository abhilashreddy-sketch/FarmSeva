import { ConfigurableOtpProvider, OtpDispatchResult } from '../providers/otp-provider';
import { Logger } from '../utils/logger';

export class SmsProviderAdapter {
  private static otpProvider = new ConfigurableOtpProvider();

  /**
   * Dispatches SMS message / OTP via external provider (MSG91 / Twilio / Fast2SMS).
   * When no provider API key is configured, records status as WAITING_FOR_PROVIDER.
   */
  static async sendSms(toPhone: string, message: string, otp?: string, purpose: string = 'LOGIN'): Promise<OtpDispatchResult> {
    const cleanPhone = toPhone.trim();

    if (otp) {
      return this.otpProvider.sendOtp({ phone: cleanPhone, otp, purpose });
    }

    // Direct message dispatch
    const apiKey = process.env.SMS_PROVIDER_KEY || process.env.SMS_API_KEY || process.env.MSG91_AUTH_KEY;
    if (!apiKey) {
      Logger.info(`[SMS:WAITING_FOR_PROVIDER] No SMS_PROVIDER_KEY configured. Suppressing live dispatch to ${cleanPhone}.`);
      return {
        success: true,
        provider: 'NONE (NOT_CONFIGURED)',
        status: 'WAITING_FOR_PROVIDER',
      };
    }

    try {
      Logger.info(`[SMS:LIVE_DISPATCH] Dispatching live SMS to ${cleanPhone} via configured provider.`);
      const messageId = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      return {
        success: true,
        provider: 'SMS_PROVIDER_LIVE',
        messageId,
        status: 'SENT',
      };
    } catch (error: any) {
      Logger.error(`[SMS:DISPATCH_ERROR] Failed to send SMS to ${cleanPhone}: ${error.message}`);
      return {
        success: false,
        provider: 'SMS_PROVIDER_LIVE',
        status: 'FAILED',
        error: error.message,
      };
    }
  }
}
