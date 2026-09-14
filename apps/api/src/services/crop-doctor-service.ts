import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/error-middleware';
import { Logger } from '../utils/logger';
import { StorageService } from './storage-service';
import { ConfigurableAiVisionProvider } from '../providers/ai-vision-provider';
import { ConfigurableTtsProvider } from '../providers/tts-provider';

const prisma = new PrismaClient();

export interface AnalyzeCropInput {
  userId: string;
  files: Array<{
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
  }>;
  crop?: string;
  problemLocation?: string;
  problemDuration?: string;
  farmerNotes?: string;
  preferredLanguage?: string;
}

export class CropDoctorService {
  private static aiVisionProvider = new ConfigurableAiVisionProvider();
  private static ttsProvider = new ConfigurableTtsProvider();

  private static ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private static MAX_IMAGES = 5;
  private static MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  /**
   * Validates uploaded files for AI Crop Doctor.
   */
  static validateImageFiles(files: Array<{ originalname: string; buffer: Buffer; mimetype: string; size: number }>) {
    if (!files || files.length === 0) {
      throw new ApiError('NO_IMAGES_PROVIDED', 'Please upload at least 1 photo of your crop/plant problem', 400);
    }

    if (files.length > this.MAX_IMAGES) {
      throw new ApiError('TOO_MANY_IMAGES', `Maximum ${this.MAX_IMAGES} photos allowed per diagnosis request`, 400);
    }

    for (const file of files) {
      if (!this.ALLOWED_IMAGE_TYPES.includes(file.mimetype.toLowerCase())) {
        throw new ApiError(
          'INVALID_IMAGE_FORMAT',
          `Format '${file.mimetype}' is not supported. Please upload JPG, PNG, or WEBP photos.`,
          400
        );
      }

      if (file.size > this.MAX_FILE_SIZE_BYTES) {
        throw new ApiError('FILE_TOO_LARGE', `Photo '${file.originalname}' exceeds maximum allowed size of 5MB`, 400);
      }
    }
  }

  /**
   * Executes AI photo diagnosis, saves image metadata, and stores diagnosis in database.
   */
  static async analyzeAndStoreDiagnosis(input: AnalyzeCropInput) {
    // 1. Validate files
    this.validateImageFiles(input.files);

    // 2. Fetch User preference if available
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { preferredLanguage: true, fullName: true },
    });

    const targetLanguage = input.preferredLanguage || user?.preferredLanguage || 'en';

    // 3. Store images via StorageService
    const storedImages: Array<{ url: string; fileType: string; fileSize: number }> = [];
    for (const file of input.files) {
      const uploadResult = await StorageService.uploadFile({
        fileName: file.originalname,
        fileBuffer: file.buffer,
        mimeType: file.mimetype,
      });
      storedImages.push({
        url: uploadResult.url,
        fileType: file.mimetype,
        fileSize: file.size,
      });
    }

    // 4. Call Multimodal AI Vision Provider
    const imageBuffers = input.files.map((f) => ({ buffer: f.buffer, mimeType: f.mimetype }));
    const aiResult = await this.aiVisionProvider.analyzeCropImages({
      imageBuffers,
      farmerContext: {
        crop: input.crop,
        problemLocation: input.problemLocation,
        problemDuration: input.problemDuration,
        farmerNotes: input.farmerNotes,
        preferredLanguage: targetLanguage,
      },
    });

    // 5. Evaluate Expert Escalation rules
    let needsExpert = aiResult.needsExpert || false;
    let expertReason = aiResult.expertReason || '';

    if (aiResult.assessment.confidence < 70) {
      needsExpert = true;
      if (!expertReason) {
        expertReason = `AI confidence rating (${aiResult.assessment.confidence}%) is below threshold. Human agronomist review recommended.`;
      }
    }

    if (!aiResult.imageQuality.acceptable) {
      needsExpert = true;
      if (!expertReason) {
        expertReason = `Image quality issues detected: ${aiResult.imageQuality.reason}`;
      }
    }

    if (aiResult.assessment.problemType === 'UNKNOWN') {
      needsExpert = true;
      if (!expertReason) {
        expertReason = 'Symptom pattern is ambiguous or unknown. Direct expert guidance required.';
      }
    }

    // 6. Optional Speech Synthesis (TTS)
    let audioUrl: string | undefined = undefined;
    const summaryText = `${aiResult.crop.name}. Possible problem: ${aiResult.assessment.primaryProblem}. ${aiResult.recommendedActions.join('. ')}`;
    const ttsResult = await this.ttsProvider.generateSpeech(summaryText, targetLanguage);
    if (ttsResult.success && ttsResult.audioBuffer) {
      const audioUpload = await StorageService.uploadFile({
        fileName: `audio_${Date.now()}.mp3`,
        fileBuffer: ttsResult.audioBuffer,
        mimeType: 'audio/mpeg',
      });
      audioUrl = audioUpload.url;
    }

    // 7. Store Diagnosis Record in Database
    const diagnosisRecord = await prisma.cropDiagnosis.create({
      data: {
        userId: input.userId,
        cropName: aiResult.crop.name,
        cropConfidence: aiResult.crop.confidence,
        primaryProblem: aiResult.assessment.primaryProblem,
        problemType: aiResult.assessment.problemType,
        confidence: aiResult.assessment.confidence,
        observationsJson: JSON.stringify(aiResult.observations),
        possibleCausesJson: JSON.stringify(aiResult.possibleCauses),
        recommendedActionsJson: JSON.stringify(aiResult.recommendedActions),
        preventionJson: JSON.stringify(aiResult.prevention),
        medicineGuidanceJson: JSON.stringify(aiResult.medicineGuidance),
        selectedLanguage: targetLanguage,
        imageQualityJson: JSON.stringify(aiResult.imageQuality),
        needsExpert,
        expertReason: expertReason || null,
        aiProvider: 'GEMINI_VISION',
        aiModel: process.env.AI_MODEL || 'gemini-3.8-flash',
        audioUrl: audioUrl || null,
        images: {
          create: storedImages.map((img, idx) => ({
            imageUrl: img.url,
            fileType: img.fileType,
            fileSize: img.fileSize,
            displayOrder: idx + 1,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    Logger.info(`Saved CropDiagnosis ${diagnosisRecord.id} for user ${input.userId} [NeedsExpert: ${needsExpert}]`);

    return this.formatDiagnosisOutput(diagnosisRecord);
  }

  /**
   * Retrieves diagnosis history for a farmer.
   */
  static async getFarmerDiagnoses(userId: string) {
    const diagnoses = await prisma.cropDiagnosis.findMany({
      where: { userId },
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });

    return diagnoses.map(this.formatDiagnosisOutput);
  }

  /**
   * Retrieves a single diagnosis by ID with authorization checks.
   */
  static async getDiagnosisById(userId: string, diagnosisId: string, userRole: string) {
    const diagnosis = await prisma.cropDiagnosis.findUnique({
      where: { id: diagnosisId },
      include: { images: true, user: true },
    });

    if (!diagnosis) {
      throw new ApiError('DIAGNOSIS_NOT_FOUND', 'Crop diagnosis record not found', 404);
    }

    if (diagnosis.userId !== userId && userRole !== 'ADMIN' && userRole !== 'AGRICULTURAL_EXPERT') {
      throw new ApiError('ACCESS_DENIED', 'Unauthorized attempt to view crop diagnosis', 403);
    }

    return this.formatDiagnosisOutput(diagnosis);
  }

  /**
   * Escalates a Crop Diagnosis to an official FARM SEVA Expert Consultation (CropProblem record).
   */
  static async escalateToExpert(userId: string, diagnosisId: string, notes?: string) {
    const diagnosis = await prisma.cropDiagnosis.findUnique({
      where: { id: diagnosisId },
      include: { images: true, user: { include: { farmerProfile: true } } },
    });

    if (!diagnosis) {
      throw new ApiError('DIAGNOSIS_NOT_FOUND', 'Crop diagnosis record not found', 404);
    }

    if (diagnosis.userId !== userId) {
      throw new ApiError('ACCESS_DENIED', 'Unauthorized attempt to escalate diagnosis', 403);
    }

    // Ensure FarmerProfile exists
    let farmerProfile = diagnosis.user.farmerProfile;
    if (!farmerProfile) {
      farmerProfile = await prisma.farmerProfile.create({
        data: { userId },
      });
    }

    // Find or create matching Crop model for reference
    let crop = await prisma.crop.findFirst({
      where: { cropName: { contains: diagnosis.cropName, mode: 'insensitive' } },
    });

    if (!crop) {
      // Find or create Farm & FarmField to associate Crop
      let farm = await prisma.farm.findFirst({ where: { farmerId: farmerProfile.id } });
      if (!farm) {
        farm = await prisma.farm.create({
          data: {
            farmerId: farmerProfile.id,
            name: 'My Farm',
            locationState: 'Telangana',
            locationDistrict: 'Warangal',
            totalAreaAcres: 1.0,
          },
        });
      }

      let field = await prisma.farmField.findFirst({ where: { farmId: farm.id } });
      if (!field) {
        field = await prisma.farmField.create({
          data: {
            farmId: farm.id,
            name: 'Field 1',
            areaAcres: 1.0,
          },
        });
      }

      crop = await prisma.crop.create({
        data: {
          fieldId: field.id,
          cropName: diagnosis.cropName,
          cropCategory: 'Commercial',
          sowingDate: new Date(),
          areaPlantedAcres: 1.0,
        },
      });
    }

    // Create CropProblem record for Expert Consultation Queue
    const cropProblem = await prisma.cropProblem.create({
      data: {
        farmerId: farmerProfile.id,
        cropId: crop.id,
        title: `Escalated AI Diagnosis: ${diagnosis.cropName} - ${diagnosis.primaryProblem}`,
        description: notes || `AI Crop Doctor Diagnosis Escalation (${diagnosis.confidence}% confidence). Reason: ${diagnosis.expertReason || 'Farmer requested expert review'}`,
        category: diagnosis.problemType === 'PEST' ? 'PEST' : diagnosis.problemType === 'NUTRIENT_DEFICIENCY' ? 'NUTRIENT' : 'DISEASE',
        severity: diagnosis.confidence < 50 ? 'HIGH' : 'MEDIUM',
        status: 'OPEN',
        images: {
          create: diagnosis.images.map((img) => ({
            imageUrl: img.imageUrl,
            fileType: img.fileType,
            fileSize: img.fileSize,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    // Create Consultation record
    const consultation = await prisma.consultation.create({
      data: {
        cropProblemId: cropProblem.id,
        status: 'REQUESTED',
      },
    });

    Logger.info(`Escalated Diagnosis ${diagnosisId} to CropProblem ${cropProblem.id} and Consultation ${consultation.id}`);

    return {
      success: true,
      cropProblemId: cropProblem.id,
      consultationId: consultation.id,
      message: 'Your crop problem has been submitted to FARM SEVA Agricultural Experts for review.',
    };
  }

  /**
   * Helper to format DB record into clean JSON structure.
   */
  private static formatDiagnosisOutput(rec: any) {
    return {
      id: rec.id,
      userId: rec.userId,
      cropName: rec.cropName,
      cropConfidence: rec.cropConfidence,
      primaryProblem: rec.primaryProblem,
      problemType: rec.problemType,
      confidence: rec.confidence,
      observations: rec.observationsJson ? JSON.parse(rec.observationsJson) : [],
      possibleCauses: rec.possibleCausesJson ? JSON.parse(rec.possibleCausesJson) : [],
      recommendedActions: rec.recommendedActionsJson ? JSON.parse(rec.recommendedActionsJson) : [],
      prevention: rec.preventionJson ? JSON.parse(rec.preventionJson) : [],
      medicineGuidance: rec.medicineGuidanceJson ? JSON.parse(rec.medicineGuidanceJson) : [],
      selectedLanguage: rec.selectedLanguage,
      imageQuality: rec.imageQualityJson ? JSON.parse(rec.imageQualityJson) : { acceptable: true, reason: '' },
      needsExpert: rec.needsExpert,
      expertReason: rec.expertReason,
      aiProvider: rec.aiProvider,
      aiModel: rec.aiModel,
      audioUrl: rec.audioUrl,
      images: rec.images || [],
      createdAt: rec.createdAt,
      updatedAt: rec.updatedAt,
    };
  }
}
