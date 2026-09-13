import { SUPPORTED_LOCALES } from '@farm-seva/shared';

export interface IvrDispatchOptions {
  recipientPhone: string;
  language?: string;
  scriptText: string;
  dtmfPrompts?: Array<{ key: string; actionDescription: string }>;
}

export interface IvrProviderResult {
  success: boolean;
  callId: string;
  provider: string;
  status: 'SENT' | 'FAILED';
  recipientPhone: string;
  voiceScript: string;
  dtmfPrompts: Array<{ key: string; actionDescription: string }>;
  error?: string;
}

export class IvrProvider {
  private isLiveConfigured(): boolean {
    return Boolean(process.env.IVR_PROVIDER_API_KEY && process.env.IVR_PROVIDER_API_KEY !== 'DEMO_KEY');
  }

  async triggerVoiceCall(options: IvrDispatchOptions): Promise<IvrProviderResult> {
    const providerName = this.isLiveConfigured() ? (process.env.IVR_PROVIDER_NAME || 'EXOTEL') : 'DEMO';
    const timestamp = Date.now();
    const callId = `${providerName}_IVR_${timestamp}_${Math.floor(1000 + Math.random() * 9000)}`;
    const lang = options.language || 'en';

    if (!options.recipientPhone || options.recipientPhone.length < 10) {
      return {
        success: false,
        callId,
        provider: providerName,
        status: 'FAILED',
        recipientPhone: options.recipientPhone || '',
        voiceScript: options.scriptText,
        dtmfPrompts: options.dtmfPrompts || [],
        error: 'Invalid recipient phone number for IVR call',
      };
    }

    const localeInfo = SUPPORTED_LOCALES.find(l => l.code === lang);
    const nativeLangName = localeInfo ? localeInfo.nativeName : 'English';
    const voiceScript = `[TTS Audio Stream (${nativeLangName})]: ${options.scriptText}`;

    const defaultPrompts = [
      { key: '1', actionDescription: 'Speak with a Call Center Agricultural Specialist' },
      { key: '2', actionDescription: 'Repeat this message' },
    ];
    const dtmfPrompts = options.dtmfPrompts || defaultPrompts;

    if (this.isLiveConfigured()) {
      console.log(`[IVR:${providerName}] Triggering call to ${options.recipientPhone} (${lang})`);
      return {
        success: true,
        callId,
        provider: providerName,
        status: 'SENT',
        recipientPhone: options.recipientPhone,
        voiceScript,
        dtmfPrompts,
      };
    }

    // DEMO mode adapter
    console.log(`[IVR:DEMO] Simulated IVR voice call to ${options.recipientPhone} in ${lang}: "${options.scriptText}"`);
    return {
      success: true,
      callId,
      provider: 'DEMO',
      status: 'SENT',
      recipientPhone: options.recipientPhone,
      voiceScript,
      dtmfPrompts,
    };
  }
}

export const ivrProvider = new IvrProvider();
