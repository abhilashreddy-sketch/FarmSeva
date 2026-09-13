import { Router } from 'express';
import { KycController } from '../controllers/kyc-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

// All KYC endpoints require user authentication
router.use(authenticateToken);

router.get('/status', KycController.getKycStatus);
router.post('/verify-pan', KycController.verifyPan);
router.post('/verify-aadhaar', KycController.verifyAadhaar);
router.post('/submit', KycController.submitKyc);
router.post('/documents/upload', KycController.uploadDocument);

export default router;
