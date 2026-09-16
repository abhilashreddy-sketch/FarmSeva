import path from 'path';
import crypto from 'crypto';
import { ApiError } from '../middleware/error-middleware';
import { env } from '../config/env';
import { Logger } from '../utils/logger';

export interface StorageFileMeta {
  documentId: string;
  userId: string;
  documentType: string;
  storageReference: string;
  verificationStatus: string;
  uploadedAt: Date;
  downloadUrl?: string;
}

export class StorageService {
  private static ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  private static MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  // Production Supabase Storage Buckets
  public static BUCKETS = {
    PRODUCT_IMAGES: 'product-images',
    CROP_PROBLEM_IMAGES: 'crop-problem-images',
    KYC_DOCUMENTS: 'kyc-documents', // Private bucket
  } as const;

  /**
   * Validates document MIME type and file size.
   */
  static validateDocument(mimeType: string, sizeBytes: number) {
    if (!this.ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      throw new ApiError(
        'INVALID_MIME_TYPE',
        `File type '${mimeType}' is not supported. Allowed formats: JPG, PNG, WEBP, PDF`,
        400
      );
    }

    if (sizeBytes > this.MAX_FILE_SIZE_BYTES) {
      throw new ApiError(
        'FILE_TOO_LARGE',
        `Document exceeds maximum allowed size of 5MB`,
        400
      );
    }
  }

  /**
   * Sanitizes file names against directory traversal vulnerabilities (.. / null bytes / shell injections).
   */
  static sanitizeFilename(fileName: string): string {
    const basename = path.basename(fileName);
    return basename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  }

  /**
   * Uploads object to Supabase Storage bucket via REST API (Server-side execution).
   */
  private static async uploadToSupabaseBucket(params: {
    bucket: string;
    objectKey: string;
    fileBuffer: Buffer;
    mimeType: string;
  }): Promise<{ url: string; key: string }> {
    const supabaseUrl = env.SUPABASE_URL;
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new ApiError('STORAGE_ERROR', 'Supabase credentials missing for cloud storage upload', 500);
    }

    const uploadEndpoint = `${supabaseUrl}/storage/v1/object/${params.bucket}/${params.objectKey}`;

    try {
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': params.mimeType,
          'x-upsert': 'true',
        },
        body: params.fileBuffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        Logger.error(`[SupabaseStorage] Upload failed for ${params.bucket}/${params.objectKey}: ${errorText}`);
        throw new ApiError('STORAGE_UPLOAD_FAILED', `Supabase Storage upload failed: ${errorText}`, 502);
      }

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${params.bucket}/${params.objectKey}`;
      Logger.info(`[SupabaseStorage] Successfully uploaded ${params.objectKey} to bucket ${params.bucket}`);
      return { url: publicUrl, key: params.objectKey };
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      Logger.error(`[SupabaseStorage] Network error uploading to ${params.bucket}: ${err.message}`);
      throw new ApiError('STORAGE_NETWORK_ERROR', `Storage network error: ${err.message}`, 502);
    }
  }

  /**
   * Stores a KYC document in private storage abstraction layer.
   */
  static async storePrivateDocument(
    userId: string,
    documentType: string,
    originalFilename: string,
    mimeType: string,
    bufferSize: number,
    fileBuffer?: Buffer
  ): Promise<StorageFileMeta> {
    this.validateDocument(mimeType, bufferSize);

    const safeName = this.sanitizeFilename(originalFilename);
    const uniqueKey = `${documentType.toLowerCase()}_${userId.substring(0, 8)}_${crypto.randomBytes(8).toString('hex')}_${safeName}`;
    const storageReference = `supabase://kyc-documents/${userId}/${uniqueKey}`;

    if (env.STORAGE_PROVIDER === 'SUPABASE_STORAGE' && fileBuffer) {
      await this.uploadToSupabaseBucket({
        bucket: this.BUCKETS.KYC_DOCUMENTS,
        objectKey: `${userId}/${uniqueKey}`,
        fileBuffer,
        mimeType,
      });
    }

    return {
      documentId: `doc_${crypto.randomUUID()}`,
      userId,
      documentType,
      storageReference,
      verificationStatus: 'PENDING',
      uploadedAt: new Date(),
    };
  }

  /**
   * Generates a temporary authorized signed download URL for private KYC documents.
   */
  static async getSignedAccessUrl(storageReference: string, userId: string, requesterRole: string): Promise<string> {
    if (!storageReference.includes(userId) && requesterRole !== 'ADMIN') {
      throw new ApiError('ACCESS_DENIED', 'Unauthorized attempt to access private document', 403);
    }

    if (env.STORAGE_PROVIDER === 'SUPABASE_STORAGE' && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const objectPath = storageReference.replace(/^supabase:\/\/kyc-documents\//, '');
        const signEndpoint = `${env.SUPABASE_URL}/storage/v1/object/sign/${this.BUCKETS.KYC_DOCUMENTS}/${objectPath}`;
        
        const response = await fetch(signEndpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: env.SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ expiresIn: 3600 }),
        });

        if (response.ok) {
          const data: any = await response.json();
          if (data.signedURL) {
            return `${env.SUPABASE_URL}/storage/v1${data.signedURL}`;
          }
        }
      } catch (err) {
        Logger.error('[SupabaseStorage] Signed URL generation failed, falling back to proxy route');
      }
    }

    const token = crypto.createHash('sha256').update(`${storageReference}:${Date.now()}`).digest('hex').substring(0, 32);
    return `/api/v1/kyc/documents/access?ref=${encodeURIComponent(storageReference)}&token=${token}`;
  }

  /**
   * Upload crop problem / general diagnostic photo.
   */
  static async uploadFile(params: { fileName: string; fileBuffer: Buffer; mimeType: string }) {
    this.validateDocument(params.mimeType, params.fileBuffer.length);
    const sanitizedKey = this.sanitizeFilename(params.fileName);
    const uniqueKey = `crop_problem_${crypto.randomBytes(8).toString('hex')}_${sanitizedKey}`;

    if (env.STORAGE_PROVIDER === 'SUPABASE_STORAGE') {
      const res = await this.uploadToSupabaseBucket({
        bucket: this.BUCKETS.CROP_PROBLEM_IMAGES,
        objectKey: uniqueKey,
        fileBuffer: params.fileBuffer,
        mimeType: params.mimeType,
      });
      return {
        url: res.url,
        key: res.key,
        mimeType: params.mimeType,
        size: params.fileBuffer.length,
      };
    }

    return {
      url: `/uploads/${uniqueKey}`,
      key: uniqueKey,
      mimeType: params.mimeType,
      size: params.fileBuffer.length,
    };
  }

  /**
   * Dedicated product photo uploader enforcing JPEG, PNG, WEBP and 5MB limit.
   */
  static async uploadProductPhoto(params: { fileName: string; fileBuffer: Buffer; mimeType: string }) {
    const allowedPhotoMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const normalizedMime = params.mimeType.toLowerCase();

    if (!allowedPhotoMimes.includes(normalizedMime)) {
      throw new ApiError(
        'INVALID_MIME_TYPE',
        `Product image format '${params.mimeType}' is not supported. Allowed image formats: JPEG, PNG, WEBP.`,
        400
      );
    }

    if (params.fileBuffer.length > this.MAX_FILE_SIZE_BYTES) {
      throw new ApiError(
        'FILE_TOO_LARGE',
        'Product photo exceeds maximum allowed file size of 5MB.',
        400
      );
    }

    const sanitizedName = this.sanitizeFilename(params.fileName);
    const uniqueKey = `product_${crypto.randomUUID()}_${sanitizedName}`;

    if (env.STORAGE_PROVIDER === 'SUPABASE_STORAGE') {
      const res = await this.uploadToSupabaseBucket({
        bucket: this.BUCKETS.PRODUCT_IMAGES,
        objectKey: uniqueKey,
        fileBuffer: params.fileBuffer,
        mimeType: normalizedMime,
      });
      return {
        url: res.url,
        key: res.key,
        mimeType: normalizedMime,
        size: params.fileBuffer.length,
      };
    }

    return {
      url: `/uploads/products/${uniqueKey}`,
      key: uniqueKey,
      mimeType: normalizedMime,
      size: params.fileBuffer.length,
    };
  }
}


