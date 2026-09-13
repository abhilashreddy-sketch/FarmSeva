import { SUPPORTED_LOCALES } from '@farm-seva/shared';

export interface SmsDispatchOptions {
  recipientPhone: string;
  message: string;
  language?: string;
  templateId?: string;
}

export interface SmsProviderResult {
  success: boolean;
  messageId: string;
  provider: string;
  status: 'SENT' | 'FAILED';
  recipientPhone: string;
  formattedMessage: string;
  error?: string;
}

export class SmsProvider {
  private isLiveConfigured(): boolean {
    return Boolean(process.env.SMS_PROVIDER_API_KEY && process.env.SMS_PROVIDER_API_KEY !== 'DEMO_KEY');
  }

  async sendSms(options: SmsDispatchOptions): Promise<SmsProviderResult> {
    const providerName = this.isLiveConfigured() ? (process.env.SMS_PROVIDER_NAME || 'MSG91') : 'DEMO';
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const messageId = `${providerName}_SMS_${timestamp}_${randomSuffix}`;

    // Language locale prefix if specified
    const lang = options.language || 'en';
    const localeInfo = SUPPORTED_LOCALES.find(l => l.code === lang);
    const prefix = localeInfo && lang !== 'en' ? `[${localeInfo.nativeName}] ` : '';
    const formattedMessage = `${prefix}${options.message}`.trim();

    if (!options.recipientPhone || options.recipientPhone.length < 10) {
      return {
        success: false,
        messageId,
        provider: providerName,
        status: 'FAILED',
        recipientPhone: options.recipientPhone || '',
        formattedMessage,
        error: 'Invalid recipient phone number format',
      };
    }

    if (this.isLiveConfigured()) {
      // Production SMS API call simulation
      console.log(`[SMS:${providerName}] Dispatching to ${options.recipientPhone}: ${formattedMessage}`);
      return {
        success: true,
        messageId,
        provider: providerName,
        status: 'SENT',
        recipientPhone: options.recipientPhone,
        formattedMessage,
      };
    }

    // DEMO mode adapter
    console.log(`[SMS:DEMO] Simulated SMS to ${options.recipientPhone} (${lang}): ${formattedMessage}`);
    return {
      success: true,
      messageId,
      provider: 'DEMO',
      status: 'SENT',
      recipientPhone: options.recipientPhone,
      formattedMessage,
    };
  }
}

export const smsProvider = new SmsProvider();
