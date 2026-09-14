import { Logger } from '../utils/logger';

export interface OtpDispatchResult {
  success: boolean;
  provider: string;
  messageId?: string;
  status: 'SENT' | 'WAITING_FOR_PROVIDER' | 'FAILED';
  error?: string;
}

export interface OtpProvider {
  name: string;
  sendOtp(params: { phone: string; otp: string; purpose: string }): Promise<OtpDispatchResult>;
}

export class Msg91OtpProvider implements OtpProvider {
  name = 'MSG91';

  async sendOtp(params: { phone: string; otp: string; purpose: string }): Promise<OtpDispatchResult> {
    const authKey = process.env.MSG91_AUTH_KEY || process.env.OTP_API_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID || process.env.OTP_TEMPLATE_ID;

    if (!authKey) {
      Logger.info(`[OTP:WAITING_FOR_PROVIDER] No MSG91_AUTH_KEY configured for phone ${params.phone}.`);
      return {
        success: true,
        provider: 'MSG91 (NOT_CONFIGURED)',
        status: 'WAITING_FOR_PROVIDER',
      };
    }

    try {
      // Clean Indian 10-digit phone number with 91 country code prefix
      const formattedPhone = params.phone.length === 10 ? `91${params.phone}` : params.phone;
      Logger.info(`[OTP:LIVE_DISPATCH] Dispatching MSG91 live OTP to +${formattedPhone} [Template: ${templateId || 'DEFAULT'}]`);

      // MSG91 v5 OTP API Endpoint
      const url = `https://control.msg91.com/api/v5/otp?template_id=${encodeURIComponent(templateId || '')}&mobile=${encodeURIComponent(formattedPhone)}&otp=${encodeURIComponent(params.otp)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'authkey': authKey,
          'Content-Type': 'application/json',
        },
      });

      const responseData: any = await response.json();

      if (!response.ok || responseData.type === 'error') {
        const errorMsg = responseData.message || responseData.msg || `HTTP ${response.status} error from MSG91`;
        Logger.error(`[OTP:DISPATCH_ERROR] MSG91 gateway error for ${params.phone}: ${errorMsg}`);
        return {
          success: false,
          provider: 'MSG91_LIVE',
          status: 'FAILED',
          error: errorMsg,
        };
      }

      const messageId = responseData.request_id || responseData.message || `msg91_${Date.now()}`;
      Logger.info(`[OTP:DISPATCH_SUCCESS] MSG91 dispatched successfully to ${params.phone} [ReqID: ${messageId}]`);

      return {
        success: true,
        provider: 'MSG91_LIVE',
        messageId: String(messageId),
        status: 'SENT',
      };
    } catch (error: any) {
      Logger.error(`[OTP:DISPATCH_ERROR] MSG91 failed to send OTP to ${params.phone}: ${error.message}`);
      return {
        success: false,
        provider: 'MSG91_LIVE',
        status: 'FAILED',
        error: error.message,
      };
    }
  }
}

export class TwilioOtpProvider implements OtpProvider {
  name = 'TWILIO';

  async sendOtp(params: { phone: string; otp: string; purpose: string }): Promise<OtpDispatchResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken) {
      Logger.info(`[OTP:WAITING_FOR_PROVIDER] No Twilio credentials configured for phone ${params.phone}.`);
      return {
        success: true,
        provider: 'TWILIO (NOT_CONFIGURED)',
        status: 'WAITING_FOR_PROVIDER',
      };
    }

    try {
      const formattedPhone = params.phone.startsWith('+') ? params.phone : `+91${params.phone}`;
      Logger.info(`[OTP:LIVE_DISPATCH] Dispatching Twilio live OTP to ${formattedPhone}`);

      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const bodyData = new URLSearchParams({
        To: formattedPhone,
        From: fromPhone || '',
        Body: `Your FARM SEVA verification code is ${params.otp}. Valid for 5 minutes.`,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyData.toString(),
      });

      const responseData: any = await response.json();

      if (!response.ok || responseData.error_code) {
        const errorMsg = responseData.message || responseData.error_message || `HTTP ${response.status} from Twilio`;
        Logger.error(`[OTP:DISPATCH_ERROR] Twilio gateway error for ${params.phone}: ${errorMsg}`);
        return {
          success: false,
          provider: 'TWILIO_LIVE',
          status: 'FAILED',
          error: errorMsg,
        };
      }

      const messageId = responseData.sid || `SM_${Date.now()}`;
      Logger.info(`[OTP:DISPATCH_SUCCESS] Twilio dispatched successfully to ${params.phone} [SID: ${messageId}]`);

      return {
        success: true,
        provider: 'TWILIO_LIVE',
        messageId: String(messageId),
        status: 'SENT',
      };
    } catch (error: any) {
      Logger.error(`[OTP:DISPATCH_ERROR] Twilio failed to send OTP to ${params.phone}: ${error.message}`);
      return {
        success: false,
        provider: 'TWILIO_LIVE',
        status: 'FAILED',
        error: error.message,
      };
    }
  }
}

export class ConfigurableOtpProvider implements OtpProvider {
  name = 'CONFIGURABLE_SMS';

  async sendOtp(params: { phone: string; otp: string; purpose: string }): Promise<OtpDispatchResult> {
    const providerName = (process.env.OTP_PROVIDER || 'MSG91').toUpperCase();

    if (providerName === 'TWILIO') {
      return new TwilioOtpProvider().sendOtp(params);
    }

    return new Msg91OtpProvider().sendOtp(params);
  }
}
