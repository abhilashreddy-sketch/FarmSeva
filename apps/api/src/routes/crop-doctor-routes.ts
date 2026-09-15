import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middleware/auth-middleware';
import { CropDoctorController } from '../controllers/crop-doctor-controller';

const router = Router();

// Configure Multer Memory Storage (Max 5MB per file, up to 5 files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
});

// Configure Server-Side Rate Limiter for AI Diagnosis (Default: 5 requests / user / hour)
const cropDoctorRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.CROP_DOCTOR_RATE_LIMIT || '5', 10),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Maximum AI Crop Doctor diagnosis limit reached (5 requests/hour). Please try again later or consult a FARM SEVA Expert.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as any).user?.id || req.ip || 'anonymous',
  validate: false,
});

// Protect all Crop Doctor routes with Authentication
router.use(authenticateToken);

// AI Vision Analysis Route (Rate-limited, multipart upload)
router.post('/analyze', cropDoctorRateLimiter, upload.array('photos', 5), CropDoctorController.analyze);

// Diagnosis History & Retrieval Routes
router.get('/history', CropDoctorController.getHistory);
router.get('/:id', CropDoctorController.getById);

// Expert Escalation Route
router.post('/:id/escalate', CropDoctorController.escalate);

export default router;
