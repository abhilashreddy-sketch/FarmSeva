import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { ApiError } from '../middleware/error-middleware';
import { logAuditEvent } from '../utils/audit-logger';
import { KycProviderAdapter } from '../adapters/kyc-provider-adapter';

const prisma = new PrismaClient();

export class KycService {
  /**
   * Validate and verify PAN Number (format: [A-Z]{5}[0-9]{4}[A-Z]{1}).
   * Returns masked PAN representation (e.g. ABCDE••••F).
   */
  static async verifyPan(userId: string, rawPan: string) {
    const pan = rawPan.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    
    if (!panRegex.test(pan)) {
      throw new ApiError('INVALID_PAN', 'Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F)', 400);
    }

    const maskedPan = `${pan.substring(0, 5)}••••${pan.substring(9)}`;
    const panRefId = `PAN_REF_${crypto.createHash('sha256').update(pan).digest('hex').substring(0, 16)}`;

    // Query external KYC provider adapter for honest verification status
    const providerResult = await KycProviderAdapter.verifyIdentity(userId, 'PAN', maskedPan);
    const initialStatus = providerResult.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING';

    // Upsert KycRecord
    const kycRecord = await prisma.kycRecord.upsert({
      where: { userId },
      update: {
        maskedPan,
        panRefId,
        updatedAt: new Date(),
      },
      create: {
        userId,
        maskedPan,
        panRefId,
        status: initialStatus,
      },
    });

    await logAuditEvent({
      userId,
      action: 'KYC_PAN_VERIFIED',
      entityName: 'KycRecord',
      entityId: kycRecord.id,
      changesJson: { maskedPan, providerStatus: providerResult.status },
    });

    return {
      message: 'PAN identity record processed successfully',
      maskedPan,
      status: initialStatus,
      provider: providerResult.provider,
      providerStatus: providerResult.status,
      notes: providerResult.notes,
    };
  }

  /**
   * Verification of Aadhaar with mandatory user consent.
   * STRICT SAFETY: Stores ONLY last 4 digits (maskedAadhaar: "•••• •••• 1234") and a SHA-256 hash reference.
   * Raw Aadhaar is NEVER stored in database or memory.
   */
  static async verifyAadhaar(userId: string, rawAadhaar: string, consent: boolean) {
    if (!consent) {
      throw new ApiError('CONSENT_REQUIRED', 'Consent is mandatory to verify Aadhaar identity', 400);
    }

    const cleanAadhaar = rawAadhaar.replace(/\s+/g, '');
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      throw new ApiError('INVALID_AADHAAR', 'Aadhaar number must be exactly 12 digits', 400);
    }

    const last4 = cleanAadhaar.slice(-4);
    const maskedAadhaar = `•••• •••• ${last4}`;
    const aadhaarRefId = `AADHAAR_REF_${crypto.createHash('sha256').update(cleanAadhaar).digest('hex').substring(0, 16)}`;

    // Query external KYC provider adapter for honest verification status
    const providerResult = await KycProviderAdapter.verifyIdentity(userId, 'AADHAAR', maskedAadhaar);
    const initialStatus = providerResult.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING';

    const kycRecord = await prisma.kycRecord.upsert({
      where: { userId },
      update: {
        maskedAadhaar,
        aadhaarRefId,
        updatedAt: new Date(),
      },
      create: {
        userId,
        maskedAadhaar,
        aadhaarRefId,
        status: initialStatus,
      },
    });

    await logAuditEvent({
      userId,
      action: 'KYC_AADHAAR_VERIFIED',
      entityName: 'KycRecord',
      entityId: kycRecord.id,
      changesJson: { maskedAadhaar, providerStatus: providerResult.status },
    });

    return {
      message: 'Aadhaar consent verification successful',
      maskedAadhaar,
      status: initialStatus,
      provider: providerResult.provider,
      providerStatus: providerResult.status,
      notes: providerResult.notes,
    };
  }

  /**
   * Submit complete KYC package (Driving License, Vehicle details, Bank details, etc.)
   */
  static async submitKyc(
    userId: string,
    data: {
      drivingLicenseNo?: string;
      vehicleType?: string;
      vehicleNumber?: string;
      bankAccountNo?: string;
      bankIfsc?: string;
    }
  ) {
    const maskedAccount = data.bankAccountNo
      ? `••••••••${data.bankAccountNo.trim().slice(-4)}`
      : undefined;

    const kycRecord = await prisma.kycRecord.upsert({
      where: { userId },
      update: {
        drivingLicenseNo: data.drivingLicenseNo?.trim(),
        vehicleType: data.vehicleType?.trim(),
        vehicleNumber: data.vehicleNumber?.trim(),
        bankAccountNo: maskedAccount,
        bankIfsc: data.bankIfsc?.trim().toUpperCase(),
        status: 'UNDER_REVIEW',
        updatedAt: new Date(),
      },
      create: {
        userId,
        drivingLicenseNo: data.drivingLicenseNo?.trim(),
        vehicleType: data.vehicleType?.trim(),
        vehicleNumber: data.vehicleNumber?.trim(),
        bankAccountNo: maskedAccount,
        bankIfsc: data.bankIfsc?.trim().toUpperCase(),
        status: 'UNDER_REVIEW',
      },
      include: { documents: true },
    });

    // Update User model kycStatus
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'UNDER_REVIEW' },
    });

    await logAuditEvent({
      userId,
      action: 'KYC_SUBMITTED',
      entityName: 'KycRecord',
      entityId: kycRecord.id,
      changesJson: { status: 'UNDER_REVIEW' },
    });

    return kycRecord;
  }

  /**
   * Attach identity or professional document to KYC record.
   */
  static async uploadDocument(
    userId: string,
    data: { documentType: string; fileName: string; fileUrl: string }
  ) {
    // Ensure KycRecord exists
    let kycRecord = await prisma.kycRecord.findUnique({ where: { userId } });
    if (!kycRecord) {
      kycRecord = await prisma.kycRecord.create({
        data: { userId, status: 'PENDING' },
      });
    }

    const document = await prisma.kycDocument.create({
      data: {
        kycRecordId: kycRecord.id,
        documentType: data.documentType,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        status: 'PENDING',
      },
    });

    return document;
  }

  /**
   * Fetch current KYC Status and Verification checklist for a user.
   */
  static async getKycStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        role: true,
        status: true,
        phoneVerified: true,
        emailVerified: true,
        kycStatus: true,
      },
    });

    if (!user) {
      throw new ApiError('USER_NOT_FOUND', 'User not found', 404);
    }

    const kycRecord = await prisma.kycRecord.findUnique({
      where: { userId },
      include: { documents: true },
    });

    return {
      userId: user.id,
      role: user.role,
      accountStatus: user.status,
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified,
      kycStatus: user.kycStatus,
      maskedAadhaar: kycRecord?.maskedAadhaar || null,
      maskedPan: kycRecord?.maskedPan || null,
      drivingLicenseNo: kycRecord?.drivingLicenseNo || null,
      vehicleType: kycRecord?.vehicleType || null,
      vehicleNumber: kycRecord?.vehicleNumber || null,
      bankAccountNo: kycRecord?.bankAccountNo || null,
      bankIfsc: kycRecord?.bankIfsc || null,
      rejectionReason: kycRecord?.rejectionReason || null,
      documents: kycRecord?.documents || [],
    };
  }

  /**
   * ADMIN AUDIT SERVICES
   */
  static async listAdminKycApplications(statusFilter?: string) {
    const whereClause: any = {};
    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }

    const applications = await prisma.kycRecord.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
          },
        },
        documents: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return applications;
  }

  static async approveKyc(adminUserId: string, kycRecordId: string, notes?: string) {
    const kycRecord = await prisma.kycRecord.findUnique({
      where: { id: kycRecordId },
      include: { user: true },
    });

    if (!kycRecord) {
      throw new ApiError('KYC_NOT_FOUND', 'KYC application record not found', 404);
    }

    // Update KycRecord
    const updatedRecord = await prisma.kycRecord.update({
      where: { id: kycRecordId },
      data: {
        status: 'VERIFIED',
        adminNotes: notes || 'Approved by Admin',
        verifiedAt: new Date(),
        verifiedByUserId: adminUserId,
      },
    });

    // Update User account status and kycStatus
    await prisma.user.update({
      where: { id: kycRecord.userId },
      data: {
        status: 'ACTIVE',
        kycStatus: 'VERIFIED',
      },
    });

    // If seller or expert, update profile verification status
    if (kycRecord.user.role === 'SELLER') {
      await prisma.seller.updateMany({
        where: { userId: kycRecord.userId },
        data: { verificationStatus: 'VERIFIED', verifiedAt: new Date(), verifiedByUserId: adminUserId },
      });
    } else if (kycRecord.user.role === 'AGRICULTURAL_EXPERT') {
      await prisma.expert.updateMany({
        where: { userId: kycRecord.userId },
        data: { verificationStatus: 'VERIFIED' },
      });
    }

    await logAuditEvent({
      userId: adminUserId,
      action: 'ADMIN_APPROVE_KYC',
      entityName: 'KycRecord',
      entityId: kycRecordId,
      changesJson: { userId: kycRecord.userId, status: 'VERIFIED' },
    });

    return updatedRecord;
  }

  static async rejectKyc(adminUserId: string, kycRecordId: string, rejectionReason: string) {
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      throw new ApiError('REASON_REQUIRED', 'Rejection reason is required when rejecting KYC', 400);
    }

    const kycRecord = await prisma.kycRecord.findUnique({ where: { id: kycRecordId } });
    if (!kycRecord) {
      throw new ApiError('KYC_NOT_FOUND', 'KYC application record not found', 404);
    }

    const updatedRecord = await prisma.kycRecord.update({
      where: { id: kycRecordId },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      },
    });

    await prisma.user.update({
      where: { id: kycRecord.userId },
      data: { kycStatus: 'REJECTED' },
    });

    await logAuditEvent({
      userId: adminUserId,
      action: 'ADMIN_REJECT_KYC',
      entityName: 'KycRecord',
      entityId: kycRecordId,
      changesJson: { rejectionReason },
    });

    return updatedRecord;
  }

  static async requestInfoKyc(adminUserId: string, kycRecordId: string, notes: string) {
    if (!notes || notes.trim().length === 0) {
      throw new ApiError('NOTE_REQUIRED', 'Instructions/note is required when requesting more info', 400);
    }

    const kycRecord = await prisma.kycRecord.findUnique({ where: { id: kycRecordId } });
    if (!kycRecord) {
      throw new ApiError('KYC_NOT_FOUND', 'KYC application record not found', 404);
    }

    const updatedRecord = await prisma.kycRecord.update({
      where: { id: kycRecordId },
      data: {
        status: 'NEEDS_INFO',
        adminNotes: notes.trim(),
      },
    });

    await prisma.user.update({
      where: { id: kycRecord.userId },
      data: { kycStatus: 'NEEDS_INFO' },
    });

    await logAuditEvent({
      userId: adminUserId,
      action: 'ADMIN_REQUEST_KYC_INFO',
      entityName: 'KycRecord',
      entityId: kycRecordId,
      changesJson: { adminNotes: notes },
    });

    return updatedRecord;
  }
}
