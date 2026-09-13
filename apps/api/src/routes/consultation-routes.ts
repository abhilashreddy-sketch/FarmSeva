import { Router } from 'express';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';
import {
  getFarmerConsultations,
  getConsultationById,
  sendConsultationMessage,
  submitExpertGuidance,
  updateConsultationStatus,
} from '../controllers/consultation-controller';

const router = Router();

// Farmer Consultation Endpoints
router.get('/farmer/consultations', authenticateToken, requireRole(UserRole.FARMER), getFarmerConsultations);
router.get('/farmer/consultations/:id', authenticateToken, requireRole(UserRole.FARMER), getConsultationById);
router.post('/farmer/consultations/:id/messages', authenticateToken, requireRole(UserRole.FARMER), sendConsultationMessage);

// Expert Consultation Endpoints
router.get('/expert/consultations', authenticateToken, requireRole(UserRole.AGRICULTURAL_EXPERT, UserRole.ADMIN), getFarmerConsultations);
router.get('/expert/consultations/:id', authenticateToken, requireRole(UserRole.AGRICULTURAL_EXPERT, UserRole.ADMIN), getConsultationById);
router.post('/expert/consultations/:id/messages', authenticateToken, requireRole(UserRole.AGRICULTURAL_EXPERT, UserRole.ADMIN), sendConsultationMessage);
router.post('/expert/crop-problems/:id/guidance', authenticateToken, requireRole(UserRole.AGRICULTURAL_EXPERT, UserRole.ADMIN), submitExpertGuidance);
router.patch('/expert/consultations/:id/status', authenticateToken, requireRole(UserRole.AGRICULTURAL_EXPERT, UserRole.ADMIN), updateConsultationStatus);

// Call Center Consultation Endpoints
router.get('/call-center/consultations/:id', authenticateToken, requireRole(UserRole.CALL_CENTER_AGENT, UserRole.ADMIN), getConsultationById);
router.post('/call-center/consultations/:id/notes', authenticateToken, requireRole(UserRole.CALL_CENTER_AGENT, UserRole.ADMIN), sendConsultationMessage);

export default router;
