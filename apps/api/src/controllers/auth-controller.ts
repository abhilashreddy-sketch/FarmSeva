import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth-service';
import { sendSuccess, sendError } from '../utils/api-response';
import {
  registerFarmerSchema,
  registerSellerSchema,
  registerExpertSchema,
  registerDeliverySchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/auth-validation';

export class AuthController {
  static async registerFarmer(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerFarmerSchema.parse(req.body);
      const user = await AuthService.registerFarmer(validatedData);
      return sendSuccess(res, user, 201);
    } catch (error) {
      next(error);
    }
  }

  static async registerSeller(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSellerSchema.parse(req.body);
      const user = await AuthService.registerSeller(validatedData);
      return sendSuccess(
        res,
        {
          user,
          notice: 'Seller registration submitted. Account is pending Admin license verification.',
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async registerExpert(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerExpertSchema.parse(req.body);
      const user = await AuthService.registerExpert(validatedData);
      return sendSuccess(
        res,
        {
          user,
          notice: 'Expert registration submitted. Account is pending Admin credential verification.',
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async registerDeliveryPartner(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerDeliverySchema.parse(req.body);
      const user = await AuthService.registerDeliveryPartner(validatedData);
      return sendSuccess(res, user, 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.login(validatedData.phone, validatedData.password, ipAddress, userAgent);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = refreshTokenSchema.parse(req.body);
      const result = await AuthService.refresh(validatedData.refreshToken);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      }
      const refreshToken = req.body?.refreshToken;
      await AuthService.logout(req.user.userId, refreshToken);
      return sendSuccess(res, { message: 'Logged out successfully' }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      }
      const userProfile = await AuthService.getUserProfile(req.user.userId);
      return sendSuccess(res, userProfile, 200);
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      const result = await AuthService.forgotPassword(validatedData.phone);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const result = await AuthService.resetPassword(validatedData.token, validatedData.newPassword);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, purpose } = req.body;
      if (!identifier) {
        return sendError(res, 'INVALID_INPUT', 'Identifier (phone or email) is required', 400);
      }
      const { OtpService } = await import('../services/otp-service');
      const result = await OtpService.sendOtp(identifier, purpose || 'LOGIN');
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, otp, purpose } = req.body;
      if (!identifier || !otp) {
        return sendError(res, 'INVALID_INPUT', 'Identifier and OTP code are required', 400);
      }
      const { OtpService } = await import('../services/otp-service');
      const result = await OtpService.verifyOtp(identifier, otp, purpose || 'LOGIN');
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async loginPhone(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, password, otp } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      if (otp) {
        const { OtpService } = await import('../services/otp-service');
        await OtpService.verifyOtp(phone, otp, 'LOGIN');
        const result = await AuthService.loginWithOtp(phone, otp, ipAddress, userAgent);
        return sendSuccess(res, result, 200);
      } else if (password) {
        const result = await AuthService.login(phone, password, ipAddress, userAgent);
        return sendSuccess(res, result, 200);
      } else {
        return sendError(res, 'INVALID_INPUT', 'Password or OTP is required for phone login', 400);
      }
    } catch (error) {
      next(error);
    }
  }

  static async loginEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, otp } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      if (otp) {
        const { OtpService } = await import('../services/otp-service');
        await OtpService.verifyOtp(email, otp, 'LOGIN');
        const result = await AuthService.loginWithOtp(email, otp, ipAddress, userAgent);
        return sendSuccess(res, result, 200);
      } else if (password) {
        const result = await AuthService.login(email, password, ipAddress, userAgent);
        return sendSuccess(res, result, 200);
      } else {
        return sendError(res, 'INVALID_INPUT', 'Password or OTP is required for email login', 400);
      }
    } catch (error) {
      next(error);
    }
  }

  static async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, purpose } = req.body;
      if (!identifier) {
        return sendError(res, 'INVALID_INPUT', 'Identifier is required to resend OTP', 400);
      }
      const { OtpService } = await import('../services/otp-service');
      const result = await OtpService.sendOtp(identifier, purpose || 'LOGIN');
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required to verify email', 401);
      }
      const { email } = req.body;
      if (!email) {
        return sendError(res, 'INVALID_INPUT', 'Email address is required', 400);
      }
      const result = await AuthService.verifyEmail(req.user.userId, email);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async registerGeneric(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.body.role || 'FARMER').toUpperCase();
      if (role === 'SELLER') {
        return AuthController.registerSeller(req, res, next);
      } else if (role === 'AGRICULTURAL_EXPERT' || role === 'EXPERT') {
        return AuthController.registerExpert(req, res, next);
      } else if (role === 'DELIVERY_PARTNER' || role === 'DELIVERY') {
        return AuthController.registerDeliveryPartner(req, res, next);
      } else {
        return AuthController.registerFarmer(req, res, next);
      }
    } catch (error) {
      next(error);
    }
  }
}
