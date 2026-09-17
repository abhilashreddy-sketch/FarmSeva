import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ApiError } from '../middleware/error-middleware';
import { Logger } from '../utils/logger';
import { SmsProviderAdapter } from '../adapters/sms-provider-adapter';

import { normalizeIndianPhone, normalizeEmail } from '../utils/identity-utils';

const prisma = new PrismaClient();

export class OtpService {
  /**
   * Validates Indian mobile phone numbers (10 digits starting with 6-9, optional +91 prefix).
   */
  static validateIndianPhone(phone: string): string {
    return normalizeIndianPhone(phone);
  }

  /**
   * Send/Generate a cryptographically secure 6-digit OTP for phone or email.
   * Enforces 60-second resend cooldown and 5-minute expiry.
   */
  static async sendOtp(identifier: string, purpose: string = 'LOGIN', userId?: string) {
    const rawIdentifier = identifier.trim();
    const isEmail = rawIdentifier.includes('@');
    
    let cleanIdentifier: string;
    if (isEmail) {
      cleanIdentifier = normalizeEmail(rawIdentifier) || rawIdentifier.toLowerCase();
    } else {
      cleanIdentifier = normalizeIndianPhone(rawIdentifier);
    }

    // Check for recent OTP within last 60 seconds (cooldown)
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

    // Cryptographically secure 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(rawOtp, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store secure hash in DB
    await prisma.otpRecord.create({
      data: {
        userId: userId || null,
        identifier: cleanIdentifier,
        otpHash,
        purpose,
        expiresAt,
      },
    });

    Logger.info(`Secure OTP generated for ${cleanIdentifier} [Purpose: ${purpose}]`);

    // Dispatch via external provider
    let smsStatus: string | undefined = undefined;
    if (!isEmail) {
      const smsResult = await SmsProviderAdapter.sendSms(
        cleanIdentifier,
        `Your FARM SEVA verification code is ${rawOtp}. Valid for 5 minutes.`,
        rawOtp,
        purpose
      );
      smsStatus = smsResult.status;
    }

    return {
      message: `OTP sent successfully to ${cleanIdentifier}`,
      expiresInSeconds: 300,
      smsStatus,
    };
  }

  /**
   * Verify an incoming OTP.
   * Enforces max 3 attempts per OTP record and invalidates single-use token.
   */
  static async verifyOtp(identifier: string, rawOtp: string, purpose: string = 'LOGIN') {
    const rawIdentifier = identifier.trim();
    const isEmail = rawIdentifier.includes('@');

    let cleanIdentifier: string;
    if (isEmail) {
      cleanIdentifier = normalizeEmail(rawIdentifier) || rawIdentifier.toLowerCase();
    } else {
      cleanIdentifier = normalizeIndianPhone(rawIdentifier);
    }

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
      // Invalidate record due to max attempts exceeded
      await prisma.otpRecord.update({
        where: { id: activeOtpRecord.id },
        data: { isUsed: true },
      });
      throw new ApiError('OTP_MAX_ATTEMPTS', 'Maximum OTP verification attempts exceeded. Please request a new OTP.', 400);
    }

    const isMatch = await bcrypt.compare(rawOtp, activeOtpRecord.otpHash);

    if (!isMatch) {
      const updatedAttempts = activeOtpRecord.attempts + 1;
      const isNowLockedOut = updatedAttempts >= activeOtpRecord.maxAttempts;

      await prisma.otpRecord.update({
        where: { id: activeOtpRecord.id },
        data: {
          attempts: updatedAttempts,
          isUsed: isNowLockedOut ? true : activeOtpRecord.isUsed,
        },
      });

      const attemptsRemaining = activeOtpRecord.maxAttempts - updatedAttempts;
      if (isNowLockedOut) {
        throw new ApiError('OTP_MAX_ATTEMPTS', 'Maximum OTP verification attempts exceeded. Please request a new OTP.', 400);
      }

      throw new ApiError('INVALID_OTP', `Incorrect OTP entered. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining.`, 400);
    }

    // Single-use invalidation
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
