import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateNumericOtp } from '../utils/auth-utils';
import { ApiError } from '../middleware/error-middleware';
import { Logger } from '../utils/logger';
import { SmsProviderAdapter } from '../adapters/sms-provider-adapter';

const prisma = new PrismaClient();

export class OtpService {
  /**
   * Send/Generate a 6-digit OTP for phone or email.
   * Enforces 60-second resend cooldown and 5-minute expiry.
   */
  static async sendOtp(identifier: string, purpose: string = 'LOGIN', userId?: string) {
    const cleanIdentifier = identifier.trim().toLowerCase();

    // Check for recent OTP within last 60 seconds (rate limiting / cooldown)
    const recentOtp = await prisma.otpRecord.findFirst({
      where: {
        identifier: cleanIdentifier,
        purpose,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentOtp) {
      throw new ApiError('OTP_RATE_LIMIT', 'Please wait 60 seconds before requesting another OTP', 429);
    }

    // Generate 6-digit numeric OTP (default to '123456' for test phone numbers in dev mode)
    const isTestMode = process.env.NODE_ENV !== 'production';
    const isDemoPhone = ['9876543210', '9123456780', '9888877770', '9777766660', '9999999999', '9988776655'].includes(cleanIdentifier);
    
    const rawOtp = (isTestMode && isDemoPhone) ? '123456' : generateNumericOtp();
    const otpHash = await bcrypt.hash(rawOtp, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store in DB
    await prisma.otpRecord.create({
      data: {
        userId: userId || null,
        identifier: cleanIdentifier,
        otpHash,
        purpose,
        expiresAt,
      },
    });

    Logger.info(`OTP generated for ${cleanIdentifier} [Purpose: ${purpose}]`);

    // Delegate live SMS sending to SmsProviderAdapter when identifier is a phone number
    let smsStatus: string | undefined = undefined;
    const isEmail = cleanIdentifier.includes('@');
    if (!isEmail) {
      const smsResult = await SmsProviderAdapter.sendSms(
        cleanIdentifier,
        `Your FARM SEVA verification code is ${rawOtp}. Valid for 5 minutes.`
      );
      smsStatus = smsResult.status;
    }

    return {
      message: `OTP sent successfully to ${cleanIdentifier}`,
      expiresInSeconds: 300,
      smsStatus,
      // Include test OTP in response ONLY during dev/demo mode for convenience
      demoOtp: isTestMode ? rawOtp : undefined,
    };
  }

  /**
   * Verify an incoming OTP.
   * Enforces max 3 attempts per OTP record.
   */
  static async verifyOtp(identifier: string, rawOtp: string, purpose: string = 'LOGIN') {
    const cleanIdentifier = identifier.trim().toLowerCase();

    const activeOtpRecord = await prisma.otpRecord.findFirst({
      where: {
        identifier: cleanIdentifier,
        purpose,
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeOtpRecord) {
      throw new ApiError('INVALID_OTP', 'Invalid or expired OTP. Please request a new code.', 400);
    }

    if (activeOtpRecord.attempts >= activeOtpRecord.maxAttempts) {
      // Invalidate record
      await prisma.otpRecord.update({
        where: { id: activeOtpRecord.id },
        data: { isUsed: true },
      });
      throw new ApiError('OTP_MAX_ATTEMPTS', 'Maximum OTP verification attempts exceeded. Please request a new OTP.', 400);
    }

    const isMatch = await bcrypt.compare(rawOtp, activeOtpRecord.otpHash);

    if (!isMatch) {
      await prisma.otpRecord.update({
        where: { id: activeOtpRecord.id },
        data: { attempts: activeOtpRecord.attempts + 1 },
      });
      throw new ApiError('INVALID_OTP', `Incorrect OTP entered. ${activeOtpRecord.maxAttempts - (activeOtpRecord.attempts + 1)} attempts remaining.`, 400);
    }

    // Mark as used
    await prisma.otpRecord.update({
      where: { id: activeOtpRecord.id },
      data: { isUsed: true },
    });

    return {
      success: true,
      identifier: cleanIdentifier,
      purpose,
    };
  }
}
