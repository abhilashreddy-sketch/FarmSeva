import { PrismaClient } from '@prisma/client';
import { UserRole, UserStatus } from '@farm-seva/shared';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshTokenString,
  hashToken,
} from '../utils/auth-utils';
import { logAuditEvent } from '../utils/audit-logger';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Register a new Farmer. Status default: ACTIVE.
   */
  static async registerFarmer(data: {
    phone: string;
    email?: string;
    fullName: string;
    password: string;
    preferredLanguage?: string;
    experienceYears?: number;
    totalLandAcres?: number;
    primaryWaterSource?: string;
  }) {
    const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existingPhone) {
      throw { statusCode: 409, code: 'AUTH_PHONE_EXISTS', message: 'Phone number already registered' };
    }

    if (data.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) {
        throw { statusCode: 409, code: 'AUTH_EMAIL_EXISTS', message: 'Email address already registered' };
      }
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        email: data.email || null,
        passwordHash,
        fullName: data.fullName,
        role: UserRole.FARMER,
        status: UserStatus.ACTIVE,
        preferredLanguage: data.preferredLanguage || 'en',
        farmerProfile: {
          create: {
            experienceYears: data.experienceYears,
            totalLandAcres: data.totalLandAcres,
            primaryWaterSource: data.primaryWaterSource,
          },
        },
      },
      include: { farmerProfile: true },
    });

    await logAuditEvent({
      userId: user.id,
      action: 'REGISTER_FARMER',
      entityName: 'User',
      entityId: user.id,
      changesJson: { phone: user.phone, email: user.email, role: user.role },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Register a new Seller. Status default: PENDING_VERIFICATION.
   */
  static async registerSeller(data: {
    phone: string;
    email?: string;
    fullName: string;
    password: string;
    preferredLanguage?: string;
    businessName: string;
    pesticideLicenseNo: string;
    fertilizerLicenseNo?: string;
    shopName: string;
    addressLine: string;
    villageLandmark?: string;
    taluk: string;
    district: string;
    state: string;
    pincode: string;
    contactPhone: string;
  }) {
    const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existingPhone) {
      throw { statusCode: 409, code: 'AUTH_PHONE_EXISTS', message: 'Phone number already registered' };
    }

    if (data.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) {
        throw { statusCode: 409, code: 'AUTH_EMAIL_EXISTS', message: 'Email address already registered' };
      }
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        email: data.email || null,
        passwordHash,
        fullName: data.fullName,
        role: UserRole.SELLER,
        status: UserStatus.PENDING_VERIFICATION,
        preferredLanguage: data.preferredLanguage || 'en',
        sellerProfile: {
          create: {
            businessName: data.businessName,
            pesticideLicenseNo: data.pesticideLicenseNo,
            fertilizerLicenseNo: data.fertilizerLicenseNo || null,
            verificationStatus: 'SUBMITTED',
            shops: {
              create: {
                shopName: data.shopName,
                addressLine: data.addressLine,
                villageLandmark: data.villageLandmark || null,
                taluk: data.taluk,
                district: data.district,
                state: data.state,
                pincode: data.pincode,
                contactPhone: data.contactPhone,
              },
            },
          },
        },
      },
      include: { sellerProfile: { include: { shops: true } } },
    });

    await logAuditEvent({
      userId: user.id,
      action: 'REGISTER_SELLER',
      entityName: 'Seller',
      entityId: user.id,
      changesJson: { businessName: data.businessName, license: data.pesticideLicenseNo },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Register a new Agricultural Expert. Status default: PENDING_VERIFICATION.
   */
  static async registerExpert(data: {
    phone: string;
    email?: string;
    fullName: string;
    password: string;
    preferredLanguage?: string;
    specialization: string;
    qualification: string;
    certificationNo?: string;
    yearsExperience: number;
  }) {
    const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existingPhone) {
      throw { statusCode: 409, code: 'AUTH_PHONE_EXISTS', message: 'Phone number already registered' };
    }

    if (data.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) {
        throw { statusCode: 409, code: 'AUTH_EMAIL_EXISTS', message: 'Email address already registered' };
      }
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        email: data.email || null,
        passwordHash,
        fullName: data.fullName,
        role: UserRole.AGRICULTURAL_EXPERT,
        status: UserStatus.PENDING_VERIFICATION,
        preferredLanguage: data.preferredLanguage || 'en',
        expertProfile: {
          create: {
            specialization: data.specialization,
            qualification: data.qualification,
            certificationNo: data.certificationNo || null,
            yearsExperience: data.yearsExperience,
          },
        },
      },
      include: { expertProfile: true },
    });

    await logAuditEvent({
      userId: user.id,
      action: 'REGISTER_EXPERT',
      entityName: 'Expert',
      entityId: user.id,
      changesJson: { specialization: data.specialization },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Register a Delivery Partner. Status default: ACTIVE.
   */
  static async registerDeliveryPartner(data: {
    phone: string;
    email?: string;
    fullName: string;
    password: string;
    preferredLanguage?: string;
    vehicleType: string;
    vehicleNumber: string;
    activeDistrict: string;
  }) {
    const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existingPhone) {
      throw { statusCode: 409, code: 'AUTH_PHONE_EXISTS', message: 'Phone number already registered' };
    }

    if (data.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) {
        throw { statusCode: 409, code: 'AUTH_EMAIL_EXISTS', message: 'Email address already registered' };
      }
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        email: data.email || null,
        passwordHash,
        fullName: data.fullName,
        role: UserRole.DELIVERY_PARTNER,
        status: UserStatus.ACTIVE,
        preferredLanguage: data.preferredLanguage || 'en',
        deliveryProfile: {
          create: {
            vehicleType: data.vehicleType,
            vehicleNumber: data.vehicleNumber,
            activeDistrict: data.activeDistrict,
          },
        },
      },
      include: { deliveryProfile: true },
    });

    await logAuditEvent({
      userId: user.id,
      action: 'REGISTER_DELIVERY_PARTNER',
      entityName: 'DeliveryPartner',
      entityId: user.id,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Admin-controlled Call Center Agent Creation.
   */
  static async createCallCenterAgent(
    adminUserId: string,
    data: {
      phone: string;
      email?: string;
      fullName: string;
      password: string;
      agentCode: string;
      department?: string;
      deskPhone?: string;
    }
  ) {
    const existingUser = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existingUser) {
      throw { statusCode: 409, code: 'AUTH_PHONE_EXISTS', message: 'Phone number already registered' };
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        email: data.email || null,
        passwordHash,
        fullName: data.fullName,
        role: UserRole.CALL_CENTER_AGENT,
        status: UserStatus.ACTIVE,
        callCenterProfile: {
          create: {
            agentCode: data.agentCode,
            department: data.department || 'FARMER_SUPPORT',
            deskPhone: data.deskPhone || null,
          },
        },
      },
      include: { callCenterProfile: true },
    });

    await logAuditEvent({
      userId: adminUserId,
      action: 'ADMIN_CREATE_CALL_CENTER_AGENT',
      entityName: 'CallCenterAgent',
      entityId: user.id,
      changesJson: { agentCode: data.agentCode },
    });

    return user;
  }

  /**
   * User Login Service.
   */
  static async login(phone: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, { email: phone }],
      },
      include: {
        farmerProfile: true,
        sellerProfile: true,
        expertProfile: true,
        deliveryProfile: true,
        callCenterProfile: true,
      },
    });

    if (!user || !user.passwordHash) {
      await logAuditEvent({
        action: 'LOGIN_FAILED_INVALID_CREDENTIALS',
        entityName: 'User',
        entityId: 'UNKNOWN',
        changesJson: { attemptedIdentifier: phone },
        ipAddress,
        userAgent,
      });
      throw { statusCode: 401, code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid phone/email or password' };
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      await logAuditEvent({
        userId: user.id,
        action: 'LOGIN_FAILED_WRONG_PASSWORD',
        entityName: 'User',
        entityId: user.id,
        ipAddress,
        userAgent,
      });
      throw { statusCode: 401, code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid phone/email or password' };
    }

    if (user.status === UserStatus.SUSPENDED) {
      await logAuditEvent({
        userId: user.id,
        action: 'LOGIN_BLOCKED_SUSPENDED',
        entityName: 'User',
        entityId: user.id,
        ipAddress,
        userAgent,
      });
      throw { statusCode: 403, code: 'AUTH_ACCOUNT_SUSPENDED', message: 'Your account has been suspended' };
    }

    if (user.status === UserStatus.DEACTIVATED || user.status === UserStatus.REJECTED) {
      throw { statusCode: 403, code: 'AUTH_ACCOUNT_INACTIVE', message: 'Account is inactive or rejected' };
    }

    // Generate JWT Access Token
    const accessToken = generateAccessToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });

    // Generate Refresh Token & hash it for database persistence
    const rawRefreshToken = generateRefreshTokenString();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Update lastLoginAt timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logAuditEvent({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      entityName: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    // Omit passwordHash from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  /**
   * Google OAuth Login & Account Linking Service.
   */
  static async loginWithGoogle(
    googlePayload: {
      googleId: string;
      email: string;
      emailVerified: boolean;
      fullName: string;
      avatarUrl?: string;
    },
    ipAddress?: string,
    userAgent?: string
  ) {
    // CASE 4: Google email is not verified by Google -> Reject safely
    if (!googlePayload.emailVerified) {
      await logAuditEvent({
        action: 'LOGIN_FAILED_UNVERIFIED_GOOGLE_EMAIL',
        entityName: 'User',
        entityId: 'UNKNOWN',
        changesJson: { email: googlePayload.email },
        ipAddress,
        userAgent,
      });
      throw {
        statusCode: 400,
        code: 'AUTH_EMAIL_UNVERIFIED',
        message: 'Your Google email is not verified by Google. Please verify your Google account email first.',
      };
    }

    const email = googlePayload.email.toLowerCase().trim();

    // Check if user already exists by googleId
    let user = await prisma.user.findFirst({
      where: { googleId: googlePayload.googleId },
      include: {
        farmerProfile: true,
        sellerProfile: true,
        expertProfile: true,
        deliveryProfile: true,
        callCenterProfile: true,
      },
    });

    // CASE 2: If not found by googleId, check if existing user has the same verified email
    if (!user) {
      user = await prisma.user.findFirst({
        where: { email },
        include: {
          farmerProfile: true,
          sellerProfile: true,
          expertProfile: true,
          deliveryProfile: true,
          callCenterProfile: true,
        },
      });

      if (user) {
        // Link existing account with Google identity
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googlePayload.googleId,
            emailVerified: true,
            avatarUrl: user.avatarUrl || googlePayload.avatarUrl || null,
          },
          include: {
            farmerProfile: true,
            sellerProfile: true,
            expertProfile: true,
            deliveryProfile: true,
            callCenterProfile: true,
          },
        });

        await logAuditEvent({
          userId: user.id,
          action: 'LINK_GOOGLE_IDENTITY_SUCCESS',
          entityName: 'User',
          entityId: user.id,
          changesJson: { email, googleId: googlePayload.googleId },
          ipAddress,
          userAgent,
        });
      }
    }

    // CASE 1: New Google user -> create FARM SEVA account
    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: googlePayload.fullName,
          email,
          googleId: googlePayload.googleId,
          authProvider: 'GOOGLE',
          role: UserRole.FARMER,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          phoneVerified: false,
          avatarUrl: googlePayload.avatarUrl || null,
          farmerProfile: {
            create: {},
          },
        },
        include: {
          farmerProfile: true,
          sellerProfile: true,
          expertProfile: true,
          deliveryProfile: true,
          callCenterProfile: true,
        },
      });

      await logAuditEvent({
        userId: user.id,
        action: 'REGISTER_GOOGLE_USER_SUCCESS',
        entityName: 'User',
        entityId: user.id,
        changesJson: { email, googleId: googlePayload.googleId, role: user.role },
        ipAddress,
        userAgent,
      });
    }

    // Check account status
    if (user.status === UserStatus.SUSPENDED) {
      await logAuditEvent({
        userId: user.id,
        action: 'LOGIN_BLOCKED_SUSPENDED',
        entityName: 'User',
        entityId: user.id,
        ipAddress,
        userAgent,
      });
      throw { statusCode: 403, code: 'AUTH_ACCOUNT_SUSPENDED', message: 'Your account has been suspended' };
    }

    if (user.status === UserStatus.DEACTIVATED || user.status === UserStatus.REJECTED) {
      throw { statusCode: 403, code: 'AUTH_ACCOUNT_INACTIVE', message: 'Account is inactive or rejected' };
    }

    // Generate FARM SEVA Access Token
    const accessToken = generateAccessToken({
      userId: user.id,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
    });

    // Generate Refresh Token & hash it for database persistence
    const rawRefreshToken = generateRefreshTokenString();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Update lastLoginAt timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logAuditEvent({
      userId: user.id,
      action: 'LOGIN_GOOGLE_SUCCESS',
      entityName: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    // Omit passwordHash from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  /**
   * User Login with OTP Service.
   */
  static async loginWithOtp(identifier: string, otp: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: identifier }, { email: identifier }],
      },
      include: {
        farmerProfile: true,
        sellerProfile: true,
        expertProfile: true,
        deliveryProfile: true,
        callCenterProfile: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, code: 'USER_NOT_FOUND', message: 'No account registered with this phone/email' };
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw { statusCode: 403, code: 'AUTH_ACCOUNT_SUSPENDED', message: 'Your account has been suspended' };
    }

    if (user.status === UserStatus.DEACTIVATED || user.status === UserStatus.REJECTED) {
      throw { statusCode: 403, code: 'AUTH_ACCOUNT_INACTIVE', message: 'Account is inactive or rejected' };
    }

    // Generate JWT Access Token
    const accessToken = generateAccessToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });

    const rawRefreshToken = generateRefreshTokenString();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Update lastLoginAt timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logAuditEvent({
      userId: user.id,
      action: 'LOGIN_OTP_SUCCESS',
      entityName: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  /**
   * Verify User Email Address.
   */
  static async verifyEmail(userId: string, email: string) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        emailVerified: true,
      },
    });

    await logAuditEvent({
      userId,
      action: 'EMAIL_VERIFIED',
      entityName: 'User',
      entityId: userId,
      changesJson: { email, emailVerified: true },
    });

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Refresh Token Service with Token Rotation.
   */
  static async refresh(rawRefreshToken: string) {
    const tokenHash = hashToken(rawRefreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw { statusCode: 401, code: 'AUTH_INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' };
    }

    if (storedToken.user.status === UserStatus.SUSPENDED) {
      throw { statusCode: 403, code: 'AUTH_ACCOUNT_SUSPENDED', message: 'Account is suspended' };
    }

    // Revoke used token (Token Rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Generate new Access Token and new Refresh Token
    const newAccessToken = generateAccessToken({
      userId: storedToken.user.id,
      phone: storedToken.user.phone,
      role: storedToken.user.role,
      status: storedToken.user.status,
    });

    const newRawRefreshToken = generateRefreshTokenString();
    const newTokenHash = hashToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: storedToken.user.id,
        tokenHash: newTokenHash,
        expiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  /**
   * Logout Service. Revokes refresh token.
   */
  static async logout(userId: string, rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { userId, tokenHash },
        data: { isRevoked: true },
      });
    } else {
      // Revoke all active refresh tokens for user
      await prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      });
    }

    await logAuditEvent({
      userId,
      action: 'LOGOUT',
      entityName: 'User',
      entityId: userId,
    });
  }

  /**
   * Forgot Password request.
   */
  static async forgotPassword(phone: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      // Generic message to prevent enumeration
      return { message: 'If phone number exists, password reset instructions have been generated' };
    }

    const rawResetToken = generateRefreshTokenString();
    const tokenHash = hashToken(rawResetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entityName: 'User',
      entityId: user.id,
    });

    return {
      message: 'If phone number exists, password reset instructions have been generated',
    };
  }

  /**
   * Reset Password completion.
   */
  static async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = hashToken(rawToken);

    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetTokenRecord || resetTokenRecord.isUsed || resetTokenRecord.expiresAt < new Date()) {
      throw { statusCode: 400, code: 'AUTH_INVALID_RESET_TOKEN', message: 'Invalid or expired password reset token' };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: resetTokenRecord.userId },
      data: { passwordHash: newPasswordHash },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetTokenRecord.id },
      data: { isUsed: true },
    });

    // Revoke existing login sessions
    await prisma.refreshToken.updateMany({
      where: { userId: resetTokenRecord.userId, isRevoked: false },
      data: { isRevoked: true },
    });

    await logAuditEvent({
      userId: resetTokenRecord.userId,
      action: 'PASSWORD_RESET_COMPLETED',
      entityName: 'User',
      entityId: resetTokenRecord.userId,
    });

    return { message: 'Password has been reset successfully. Please log in with your new password.' };
  }

  /**
   * Get User Profile Details.
   */
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        farmerProfile: true,
        sellerProfile: { include: { shops: true } },
        expertProfile: true,
        deliveryProfile: true,
        callCenterProfile: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, code: 'USER_NOT_FOUND', message: 'User not found' };
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
