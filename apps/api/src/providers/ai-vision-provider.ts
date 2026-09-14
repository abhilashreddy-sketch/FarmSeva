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

  async analyzeCropImages(params: AiVisionAnalysisParams): Promise<AiVisionAnalysisResult> {
    const provider = (process.env.AI_PROVIDER || 'GEMINI').toUpperCase();
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    const model = process.env.AI_MODEL || 'gemini-3.8-flash';

    if (!apiKey) {
      Logger.info(`[AI_VISION:NOT_CONFIGURED] No AI_API_KEY / GEMINI_API_KEY configured for provider ${provider}.`);
      throw new ApiError(
        'SERVICE_NOT_CONFIGURED',
        'AI Crop Doctor vision service is currently not configured on this server. Please set AI_API_KEY or GEMINI_API_KEY in server environment variables.',
        503
      );
    }

    try {
      Logger.info(`[AI_VISION:LIVE_QUERY] Provider=${provider} Model=${model} Images=${params.imageBuffers.length} Lang=${params.farmerContext.preferredLanguage}`);

      // Prepare multi-modal payload with base64 images
      const contentsParts: any[] = [];

      // System instruction & Structured Output Prompt
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

      contentsParts.push({ text: systemPrompt });

      // Append base64 image data
      for (const img of params.imageBuffers) {
        contentsParts.push({
          inline_data: {
            mime_type: img.mimeType,
            data: img.buffer.toString('base64'),
          },
        });
      }

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
        const errorMsg = responseData.error?.message || `HTTP ${response.status} error from ${provider} API`;
        Logger.error(`[AI_VISION:API_ERROR] ${provider} API call failed: ${errorMsg}`);
        throw new ApiError('AI_PROVIDER_ERROR', `AI Vision Provider error: ${errorMsg}`, 502);
      }

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
        Logger.error(`[AI_VISION:JSON_PARSE_ERROR] Failed to parse JSON from AI response: ${candidateText}`);
        throw new ApiError('AI_RESPONSE_MALFORMED', 'AI provider output was not valid JSON', 502);
      }

      // Enforce Zod Schema validation
      const validation = AiVisionAnalysisResultSchema.safeParse(parsedObject);
      if (!validation.success) {
        Logger.error(`[AI_VISION:SCHEMA_VALIDATION_ERROR] AI response failed schema check: ${validation.error.message}`);
        throw new ApiError('AI_RESPONSE_MALFORMED', `AI provider response did not conform to required output schema: ${validation.error.issues[0]?.message}`, 502);
      }

      const validatedResult = validation.data;

      Logger.info(`[AI_VISION:SUCCESS] Analysis complete: Crop=${validatedResult.crop.name}, Problem=${validatedResult.assessment.primaryProblem}, Confidence=${validatedResult.assessment.confidence}%`);

      return validatedResult;
    } catch (error: any) {
      if (error instanceof ApiError || error?.statusCode || error?.code) throw error;
      Logger.error(`[AI_VISION:EXCEPTION] Unexpected error during AI analysis: ${error.message}`);
      throw new ApiError('AI_ANALYSIS_FAILED', `Failed to complete AI crop diagnosis: ${error.message}`, 500);
    }
  }
}

export class ConfigurableAiVisionProvider implements AiVisionProvider {
  name = 'CONFIGURABLE_AI_VISION';

  async analyzeCropImages(params: AiVisionAnalysisParams): Promise<AiVisionAnalysisResult> {
    return new GeminiVisionProvider().analyzeCropImages(params);
  }
}
