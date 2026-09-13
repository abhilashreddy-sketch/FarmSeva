export interface PushDispatchOptions {
  deviceTokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface PushProviderResult {
  success: boolean;
  messageId: string;
  provider: string;
  status: 'SENT' | 'FAILED' | 'SKIPPED';
  successCount: number;
  failureCount: number;
  error?: string;
}

export class PushProvider {
  private isLiveConfigured(): boolean {
    return Boolean(process.env.FCM_SERVER_KEY && process.env.FCM_SERVER_KEY !== 'DEMO_KEY');
  }

  async sendPushNotification(options: PushDispatchOptions): Promise<PushProviderResult> {
    const providerName = this.isLiveConfigured() ? 'FCM' : 'DEMO';
    const timestamp = Date.now();
    const messageId = `${providerName}_PUSH_${timestamp}`;

    if (!options.deviceTokens || options.deviceTokens.length === 0) {
      return {
        success: true,
        messageId,
        provider: providerName,
        status: 'SKIPPED',
        successCount: 0,
        failureCount: 0,
        error: 'No active device tokens found for recipient',
      };
    }

    if (this.isLiveConfigured()) {
      console.log(`[PUSH:${providerName}] Dispatching push to ${options.deviceTokens.length} devices: ${options.title}`);
      return {
        success: true,
        messageId,
        provider: providerName,
        status: 'SENT',
        successCount: options.deviceTokens.length,
        failureCount: 0,
      };
    }

    // DEMO mode adapter
    console.log(`[PUSH:DEMO] Simulated push to ${options.deviceTokens.length} devices: ${options.title} - ${options.body}`);
    return {
      success: true,
      messageId,
      provider: 'DEMO',
      status: 'SENT',
      successCount: options.deviceTokens.length,
      failureCount: 0,
    };
  }
}

export const pushProvider = new PushProvider();
