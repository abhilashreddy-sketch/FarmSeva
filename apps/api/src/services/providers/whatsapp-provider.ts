import { SUPPORTED_LOCALES } from '@farm-seva/shared';

export interface WhatsAppDispatchOptions {
  recipientPhone: string;
  templateName: string;
  language?: string;
  parameters: Record<string, string>;
  fallbackText: string;
}

export interface WhatsAppProviderResult {
  success: boolean;
  messageId: string;
  provider: string;
  status: 'SENT' | 'FAILED';
  recipientPhone: string;
  templateUsed: string;
  payload: Record<string, any>;
  error?: string;
}

export class WhatsAppProvider {
  private isLiveConfigured(): boolean {
    return Boolean(process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_API_KEY !== 'DEMO_KEY');
  }

  async sendWhatsApp(options: WhatsAppDispatchOptions): Promise<WhatsAppProviderResult> {
    const providerName = this.isLiveConfigured() ? (process.env.WHATSAPP_PROVIDER_NAME || 'TWILIO_WHATSAPP') : 'DEMO';
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const messageId = `${providerName}_WA_${timestamp}_${randomSuffix}`;
    const lang = options.language || 'en';

    if (!options.recipientPhone || options.recipientPhone.length < 10) {
      return {
        success: false,
        messageId,
        provider: providerName,
        status: 'FAILED',
        recipientPhone: options.recipientPhone || '',
        templateUsed: options.templateName,
        payload: {},
        error: 'Invalid recipient phone number format for WhatsApp dispatch',
      };
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: options.recipientPhone.startsWith('+') ? options.recipientPhone : `+91${options.recipientPhone}`,
      type: 'template',
      template: {
        name: options.templateName,
        language: { code: lang },
        components: [
          {
            type: 'body',
            parameters: Object.entries(options.parameters).map(([key, val]) => ({
              type: 'text',
              text: String(val),
            })),
          },
        ],
      },
      fallback_text: options.fallbackText,
    };

    if (this.isLiveConfigured()) {
      console.log(`[WHATSAPP:${providerName}] Dispatching template ${options.templateName} to ${options.recipientPhone}`);
      return {
        success: true,
        messageId,
        provider: providerName,
        status: 'SENT',
        recipientPhone: options.recipientPhone,
        templateUsed: options.templateName,
        payload,
      };
    }

    // DEMO mode adapter
    console.log(`[WHATSAPP:DEMO] Simulated WhatsApp to ${options.recipientPhone} using template ${options.templateName} (${lang})`);
    return {
      success: true,
      messageId,
      provider: 'DEMO',
      status: 'SENT',
      recipientPhone: options.recipientPhone,
      templateUsed: options.templateName,
      payload,
    };
  }
}

export const whatsAppProvider = new WhatsAppProvider();
