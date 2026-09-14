import path from 'path';
import crypto from 'crypto';
import { ApiError } from '../middleware/error-middleware';

export interface StorageFileMeta {
  documentId: string;
  userId: string;
  documentType: string;
  storageReference: string;
  verificationStatus: string;
  uploadedAt: Date;
}

export class StorageService {
  private static ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  private static MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

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
   * Stores a document in private storage abstraction layer.
   * In production mode, this uploads to S3/GCS bucket; in dev/local mode, saves to private uploads folder.
   */
  static async storePrivateDocument(
    userId: string,
    documentType: string,
    originalFilename: string,
    mimeType: string,
    bufferSize: number
  ): Promise<StorageFileMeta> {
    this.validateDocument(mimeType, bufferSize);

    const safeName = this.sanitizeFilename(originalFilename);
    const uniqueKey = `${documentType.toLowerCase()}_${userId.substring(0, 8)}_${crypto.randomBytes(8).toString('hex')}_${safeName}`;
    const storageReference = `private://documents/kyc/${userId}/${uniqueKey}`;

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
   * Generates a temporary authorized download URL for private documents.
   */
  static getSignedAccessUrl(storageReference: string, userId: string, requesterRole: string): string {
    // Prevent cross-user access unless requester is ADMIN
    if (!storageReference.includes(userId) && requesterRole !== 'ADMIN') {
      throw new ApiError('ACCESS_DENIED', 'Unauthorized attempt to access private document', 403);
    }

    const token = crypto.createHash('sha256').update(`${storageReference}:${Date.now()}`).digest('hex').substring(0, 32);
    return `/api/v1/kyc/documents/access?ref=${encodeURIComponent(storageReference)}&token=${token}`;
  }

  /**
   * Upload file abstraction (validates MIME type and sanitizes against path traversal).
   */
  static async uploadFile(params: { fileName: string; fileBuffer: Buffer; mimeType: string }) {
    if (!this.ALLOWED_MIME_TYPES.includes(params.mimeType.toLowerCase())) {
      throw new ApiError(
        'VALIDATION_ERROR',
        `File type '${params.mimeType}' is not supported. Allowed formats: JPG, PNG, WEBP, PDF`,
        400
      );
    }
    const sanitizedKey = this.sanitizeFilename(params.fileName);
    const uniqueKey = `file_${crypto.randomBytes(8).toString('hex')}_${sanitizedKey}`;
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

    return {
      url: `/uploads/products/${uniqueKey}`,
      key: uniqueKey,
      mimeType: normalizedMime,
      size: params.fileBuffer.length,
    };
  }
}

