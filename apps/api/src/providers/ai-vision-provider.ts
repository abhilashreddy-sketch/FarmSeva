import { z } from 'zod';
import { ApiError } from '../middleware/error-middleware';
import { Logger } from '../utils/logger';

export const AiVisionAnalysisResultSchema = z.object({
  crop: z.object({
    name: z.string(),
    confidence: z.number().min(0).max(100),
  }),
  assessment: z.object({
    primaryProblem: z.string(),
    problemType: z.enum(['DISEASE', 'PEST', 'NUTRIENT_DEFICIENCY', 'ENVIRONMENTAL', 'PHYSICAL_DAMAGE', 'UNKNOWN']),
    confidence: z.number().min(0).max(100),
  }),
  observations: z.array(z.string()),
  possibleCauses: z.array(z.string()),
  recommendedActions: z.array(z.string()),
  prevention: z.array(z.string()),
  medicineGuidance: z.array(z.string()),
  needsExpert: z.boolean(),
  expertReason: z.string().optional().default(''),
  imageQuality: z.object({
    acceptable: z.boolean(),
    reason: z.string(),
  }),
});

export type AiVisionAnalysisResult = z.infer<typeof AiVisionAnalysisResultSchema>;

export interface AiVisionAnalysisParams {
  imageBuffers: Array<{ buffer: Buffer; mimeType: string }>;
  farmerContext: {
    crop?: string;
    problemLocation?: string;
    problemDuration?: string;
    farmerNotes?: string;
    preferredLanguage: string;
  };
}

export interface AiVisionProvider {
  name: string;
  analyzeCropImages(params: AiVisionAnalysisParams): Promise<AiVisionAnalysisResult>;
}

export class GeminiVisionProvider implements AiVisionProvider {
  name = 'GEMINI_VISION';

  private isTransientStatus(status: number, statusText?: string): boolean {
    if ([429, 408, 500, 502, 503, 504].includes(status)) return true;
    if (statusText === 'UNAVAILABLE' || statusText === 'RESOURCE_EXHAUSTED') return true;
    return false;
  }

  private isPermanentStatus(status: number): boolean {
    return [400, 401, 403, 404].includes(status);
  }

  private calculateBackoffDelay(attempt: number): number {
    const baseDelayMs = 1000;
    const maxDelayMs = 4000;
    const jitterMs = Math.floor(Math.random() * 300);
    const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);
    return Math.min(maxDelayMs, exponentialDelay + jitterMs);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildPromptPayload(params: AiVisionAnalysisParams): any[] {
    const systemPrompt = `
You are an expert agricultural scientist and agronomist analyzing crop disease and pest photos for Indian farmers.
Language for response: ${params.farmerContext.preferredLanguage || 'en'}

Farmer Context:
- Expected Crop: ${params.farmerContext.crop || 'Unknown/Not specified'}
- Problem Location: ${params.farmerContext.problemLocation || 'Unknown'}
- Duration Observed: ${params.farmerContext.problemDuration || 'Unknown'}
- Farmer Notes: ${params.farmerContext.farmerNotes || 'None'}

RULES FOR DIAGNOSIS:
1. Examine all uploaded crop images carefully.
2. If image quality is blurry, dark, non-crop, or unacceptable, set "imageQuality": { "acceptable": false, "reason": "Explanation of why quality is poor" } and set "needsExpert": true.
3. If the crop or problem cannot be identified with high confidence, set "problemType": "UNKNOWN", "confidence": 0, and set "needsExpert": true.
4. Do NOT hallucinate symptoms or diagnose diseases that are not clearly visible.
5. Provide actionable, practical advice in farmer-friendly language.
6. Do NOT prescribe unverified chemical dosages or exact product names. Keep medicine guidance to safe treatment categories and preventive measures.

REQUIRED JSON OUTPUT (Respond ONLY in valid JSON matching this exact schema):
{
  "crop": {
    "name": "Identified Crop Name in selected language",
    "confidence": 85
  },
  "assessment": {
    "primaryProblem": "Name of disease, pest, or deficiency",
    "problemType": "DISEASE",
    "confidence": 80
  },
  "observations": ["Visible symptom 1", "Visible symptom 2"],
  "possibleCauses": ["Fungal pathogen", "High humidity"],
  "recommendedActions": ["Step 1", "Step 2"],
  "prevention": ["Preventive measure 1"],
  "medicineGuidance": ["General fungicide category advice without specific dosages"],
  "needsExpert": false,
  "expertReason": "Reason if expert escalation is recommended",
  "imageQuality": {
    "acceptable": true,
    "reason": "Image quality is clear"
  }
}
`;

    const contentsParts: any[] = [{ text: systemPrompt }];

    for (const img of params.imageBuffers) {
      contentsParts.push({
        inline_data: {
          mime_type: img.mimeType,
          data: img.buffer.toString('base64'),
        },
      });
    }

    return contentsParts;
  }

  private async attemptGenerateContent(
    model: string,
    apiKey: string,
    contentsParts: any[],
    params: AiVisionAnalysisParams
  ): Promise<AiVisionAnalysisResult> {
    const maxRetries = parseInt(process.env.AI_MAX_RETRIES || '4', 10);
    let lastErrorStatus = 503;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.info(
          `[AI_VISION:REQUEST] Provider=GEMINI Model=${model} Attempt=${attempt}/${maxRetries} Images=${params.imageBuffers.length} Lang=${params.farmerContext.preferredLanguage}`
        );

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: contentsParts }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        });

        const responseData: any = await response.json();

        if (!response.ok || responseData.error) {
          const status = response.status || responseData.error?.code || 500;
          const statusText = responseData.error?.status || 'API_ERROR';
          const errorMsg = responseData.error?.message || `HTTP ${status} error from Gemini API`;
          lastErrorStatus = status;

          // Diagnostic Server Log (Safe: No API key, headers, image base64, or user PII)
          Logger.warn(
            `[AI_VISION:SERVER_DIAGNOSTIC] Model=${model} Attempt=${attempt}/${maxRetries} HTTP=${status} Status=${statusText} ErrorMsg="${errorMsg}"`
          );

          // Permanent non-retryable errors (400, 401, 403, 404)
          if (this.isPermanentStatus(status)) {
            Logger.error(`[AI_VISION:PERMANENT_ERROR] Non-retryable error HTTP ${status}: ${errorMsg}`);
            if (status === 401 || status === 403) {
              throw new ApiError('AI_AUTH_FAILED', 'AI service authorization failed. Please check server API key configuration.', status);
            }
            if (status === 404) {
              throw new ApiError('AI_MODEL_NOT_FOUND', `AI model '${model}' was not found or is not supported for multimodal vision analysis.`, status);
            }
            throw new ApiError('AI_PROVIDER_ERROR', `AI Vision Provider error: ${errorMsg}`, status);
          }

          // Transient retryable errors (503, 429, 408, 500, 502, 504)
          if (this.isTransientStatus(status, statusText)) {
            if (attempt < maxRetries) {
              const delay = this.calculateBackoffDelay(attempt);
              Logger.warn(
                `[AI_VISION:RETRYING] Transient error HTTP ${status} (${statusText}). Backing off for ${delay}ms before attempt ${attempt + 1}/${maxRetries}...`
              );
              await this.sleep(delay);
              continue;
            }
          }

          throw new ApiError(
            'AI_SERVICE_UNAVAILABLE',
            'AI service is temporarily busy. Your photo was received, but the diagnosis could not be completed right now. Please try again shortly.',
            503
          );
        }

        // Response OK (200)
        const candidateText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) {
          throw new ApiError('AI_PROVIDER_ERROR', 'AI API returned an empty analysis text payload', 502);
        }

        // Parse JSON output
        const cleanJsonText = candidateText.replace(/```json\n?|\n?```/g, '').trim();
        let parsedObject: any;
        try {
          parsedObject = JSON.parse(cleanJsonText);
        } catch (e: any) {
          Logger.error(`[AI_VISION:JSON_PARSE_ERROR] Failed to parse JSON output from model ${model}: ${candidateText}`);
          throw new ApiError('AI_RESPONSE_MALFORMED', 'AI provider output was not valid JSON', 502);
        }

        // Enforce Zod Schema validation
        const validation = AiVisionAnalysisResultSchema.safeParse(parsedObject);
        if (!validation.success) {
          Logger.error(`[AI_VISION:SCHEMA_VALIDATION_ERROR] Response failed schema check: ${validation.error.message}`);
          throw new ApiError(
            'AI_RESPONSE_MALFORMED',
            `AI provider response did not conform to required output schema: ${validation.error.issues[0]?.message}`,
            502
          );
        }

        Logger.info(
          `[AI_VISION:SUCCESS] Model=${model} Crop=${validation.data.crop.name}, Problem=${validation.data.assessment.primaryProblem}, Confidence=${validation.data.assessment.confidence}%`
        );

        return validation.data;
      } catch (err: any) {
        if (err instanceof ApiError) throw err;

        Logger.warn(`[AI_VISION:NETWORK_EXCEPTION] Attempt=${attempt}/${maxRetries} Model=${model} Network Exception: ${err.message}`);
        if (attempt < maxRetries) {
          const delay = this.calculateBackoffDelay(attempt);
          await this.sleep(delay);
          continue;
        }

        throw new ApiError(
          'AI_SERVICE_UNAVAILABLE',
          'AI service is temporarily busy. Your photo was received, but the diagnosis could not be completed right now. Please try again shortly.',
          503
        );
      }
    }

    throw new ApiError(
      'AI_SERVICE_UNAVAILABLE',
      'AI service is temporarily busy. Your photo was received, but the diagnosis could not be completed right now. Please try again shortly.',
      503
    );
  }

  async analyzeCropImages(params: AiVisionAnalysisParams): Promise<AiVisionAnalysisResult> {
    const provider = (process.env.AI_PROVIDER || 'GEMINI').toUpperCase();
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    const primaryModel = process.env.AI_MODEL || 'gemini-3.8-flash';
    const fallbackModel = process.env.AI_FALLBACK_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      Logger.info(`[AI_VISION:NOT_CONFIGURED] No AI_API_KEY configured for provider ${provider}.`);
      throw new ApiError(
        'SERVICE_NOT_CONFIGURED',
        'AI Crop Doctor vision service is currently not configured on this server. Please set AI_API_KEY in server environment variables.',
        503
      );
    }

    const contentsParts = this.buildPromptPayload(params);

    try {
      return await this.attemptGenerateContent(primaryModel, apiKey, contentsParts, params);
    } catch (primaryErr: any) {
      // If primary model failed due to transient unavailability (503 / AI_SERVICE_UNAVAILABLE) and a fallback model is configured
      if (
        fallbackModel &&
        fallbackModel !== primaryModel &&
        (primaryErr?.statusCode === 503 || primaryErr?.code === 'AI_SERVICE_UNAVAILABLE')
      ) {
        Logger.warn(
          `[AI_VISION:FALLBACK_TRIGGERED] Primary model '${primaryModel}' exhausted retries due to high demand/503. Executing fallback model '${fallbackModel}'...`
        );
        try {
          return await this.attemptGenerateContent(fallbackModel, apiKey, contentsParts, params);
        } catch (fallbackErr: any) {
          Logger.error(`[AI_VISION:FALLBACK_FAILED] Fallback model '${fallbackModel}' also failed: ${fallbackErr.message}`);
          throw fallbackErr;
        }
      }

      throw primaryErr;
    }
  }
}

export class ConfigurableAiVisionProvider implements AiVisionProvider {
  name = 'CONFIGURABLE_AI_VISION';

  async analyzeCropImages(params: AiVisionAnalysisParams): Promise<AiVisionAnalysisResult> {
    return new GeminiVisionProvider().analyzeCropImages(params);
  }
}
