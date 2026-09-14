import { Logger } from '../utils/logger';

export interface TtsDispatchResult {
  success: boolean;
  provider: string;
  audioUrl?: string;
  audioBuffer?: Buffer;
  status: 'GENERATED' | 'NOT_CONFIGURED' | 'FAILED';
  error?: string;
}

export interface TtsProvider {
  name: string;
  generateSpeech(text: string, languageCode: string): Promise<TtsDispatchResult>;
}

export class GoogleTtsProvider implements TtsProvider {
  name = 'GOOGLE_TTS';

  // Map application language codes to Google Cloud TTS voice BCP-47 language codes
  private static VOICE_LANG_MAP: Record<string, string> = {
    en: 'en-IN',
    te: 'te-IN',
    hi: 'hi-IN',
    kn: 'kn-IN',
    ta: 'ta-IN',
    ml: 'ml-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
  };

  async generateSpeech(text: string, languageCode: string): Promise<TtsDispatchResult> {
    const apiKey = process.env.TTS_API_KEY || process.env.GOOGLE_TTS_KEY;

    if (!apiKey) {
      Logger.info(`[TTS:NOT_CONFIGURED] No TTS_API_KEY / GOOGLE_TTS_KEY configured for speech generation.`);
      return {
        success: false,
        provider: 'GOOGLE_TTS (NOT_CONFIGURED)',
        status: 'NOT_CONFIGURED',
      };
    }

    try {
      const bcpLanguage = GoogleTtsProvider.VOICE_LANG_MAP[languageCode] || 'en-IN';
      Logger.info(`[TTS:LIVE_DISPATCH] Synthesizing speech via Google Cloud TTS [Lang: ${bcpLanguage}]`);

      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: bcpLanguage,
            ssmlGender: 'NEUTRAL',
          },
          audioConfig: {
            audioEncoding: 'MP3',
          },
        }),
      });

      const responseData: any = await response.json();

      if (!response.ok || responseData.error) {
        const errorMsg = responseData.error?.message || `HTTP ${response.status} from Google TTS`;
        Logger.error(`[TTS:DISPATCH_ERROR] Google TTS API call failed: ${errorMsg}`);
        return {
          success: false,
          provider: 'GOOGLE_TTS_LIVE',
          status: 'FAILED',
          error: errorMsg,
        };
      }

      if (!responseData.audioContent) {
        return {
          success: false,
          provider: 'GOOGLE_TTS_LIVE',
          status: 'FAILED',
          error: 'TTS API returned empty audio content payload',
        };
      }

      const audioBuffer = Buffer.from(responseData.audioContent, 'base64');

      return {
        success: true,
        provider: 'GOOGLE_TTS_LIVE',
        audioBuffer,
        status: 'GENERATED',
      };
    } catch (error: any) {
      Logger.error(`[TTS:EXCEPTION] Unexpected error during TTS generation: ${error.message}`);
      return {
        success: false,
        provider: 'GOOGLE_TTS_LIVE',
        status: 'FAILED',
        error: error.message,
      };
    }
  }
}

export class ConfigurableTtsProvider implements TtsProvider {
  name = 'CONFIGURABLE_TTS';

  async generateSpeech(text: string, languageCode: string): Promise<TtsDispatchResult> {
    return new GoogleTtsProvider().generateSpeech(text, languageCode);
  }
}
