import { Router } from 'express';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';
import {
  createCropProblem,
  getFarmerCropProblems,
  getCropProblemById,
  addCropProblemImage,
  deleteCropProblemImage,
  requestExpertConsultation,
  updateCropProblemStatus,
} from '../controllers/crop-problem-controller';
import { assignExpertToProblem, adminAssignExpert } from '../controllers/expert-controller';

const router = Router();

// Farmer Endpoints
router.get('/farmer/crop-problems', authenticateToken, requireRole(UserRole.FARMER), getFarmerCropProblems);
router.post('/farmer/crop-problems', authenticateToken, requireRole(UserRole.FARMER), createCropProblem);
router.get('/farmer/crop-problems/:id', authenticateToken, requireRole(UserRole.FARMER, UserRole.ADMIN), getCropProblemById);
router.patch('/farmer/crop-problems/:id', authenticateToken, requireRole(UserRole.FARMER, UserRole.ADMIN), updateCropProblemStatus);
router.post('/farmer/crop-problems/:id/images', authenticateToken, requireRole(UserRole.FARMER), addCropProblemImage);
router.delete('/farmer/crop-problems/:id/images/:imageId', authenticateToken, requireRole(UserRole.FARMER), deleteCropProblemImage);
router.post('/farmer/crop-problems/:id/request-expert', authenticateToken, requireRole(UserRole.FARMER), requestExpertConsultation);

// Expert Endpoints
router.get('/expert/crop-problems', authenticateToken, requireRole(UserRole.AGRICULTURAL_EXPERT, UserRole.ADMIN), getFarmerCropProblems);
router.get('/expert/crop-problems/:id', authenticateToken, requireRole(UserRole.AGRICULTURAL_EXPERT, UserRole.ADMIN), getCropProblemById);
router.post('/expert/crop-problems/:id/assign', authenticateToken, requireRole(UserRole.AGRICULTURAL_EXPERT, UserRole.ADMIN), assignExpertToProblem);

// Admin Endpoints
router.get('/admin/crop-problems', authenticateToken, requireRole(UserRole.ADMIN), getFarmerCropProblems);
router.get('/admin/crop-problems/:id', authenticateToken, requireRole(UserRole.ADMIN), getCropProblemById);
router.post('/admin/crop-problems/:id/assign-expert', authenticateToken, requireRole(UserRole.ADMIN), adminAssignExpert);
router.post('/admin/crop-problems/:id/reassign-expert', authenticateToken, requireRole(UserRole.ADMIN), adminAssignExpert);
router.patch('/admin/crop-problems/:id/status', authenticateToken, requireRole(UserRole.ADMIN), updateCropProblemStatus);

// Call Center Endpoints
router.get('/call-center/farmers/:farmerUserId/crop-problems', authenticateToken, requireRole(UserRole.CALL_CENTER_AGENT, UserRole.ADMIN), getFarmerCropProblems);
router.post('/call-center/farmers/:farmerUserId/crop-problems', authenticateToken, requireRole(UserRole.CALL_CENTER_AGENT, UserRole.ADMIN), createCropProblem);

export default router;
