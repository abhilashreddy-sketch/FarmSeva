import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

// Public Authentication & Registration Endpoints
router.post('/register', AuthController.registerGeneric);
router.post('/register/farmer', AuthController.registerFarmer);
router.post('/register/seller', AuthController.registerSeller);
router.post('/register/expert', AuthController.registerExpert);
router.post('/register/delivery', AuthController.registerDeliveryPartner);

router.post('/login', AuthController.login);
router.post('/login/phone', AuthController.loginPhone);
router.post('/login/email', AuthController.loginEmail);
router.get('/google', AuthController.initiateGoogleAuth);
router.get('/google/callback', AuthController.handleGoogleCallback);
router.post('/google/callback', AuthController.handleGoogleCallback);
router.post('/google', AuthController.loginWithGoogleToken);
router.post('/send-otp', AuthController.sendOtp);
router.post('/resend-otp', AuthController.resendOtp);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected Authentication Endpoints
router.post('/logout', authenticateToken, AuthController.logout);
router.post('/verify-email', authenticateToken, AuthController.verifyEmail);
router.get('/me', authenticateToken, AuthController.getMe);

export default router;
