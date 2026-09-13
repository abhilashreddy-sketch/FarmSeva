import { Router } from 'express';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';
import { getExpertCases, adminVerifyExpert, adminListExperts } from '../controllers/expert-controller';

const router = Router();

// Expert Cases Dashboard
router.get('/expert/cases', authenticateToken, requireRole(UserRole.AGRICULTURAL_EXPERT, UserRole.ADMIN), getExpertCases);

// Admin Expert Management
router.get('/admin/experts', authenticateToken, requireRole(UserRole.ADMIN), adminListExperts);
router.patch('/admin/experts/:id/verify', authenticateToken, requireRole(UserRole.ADMIN), adminVerifyExpert);

export default router;
