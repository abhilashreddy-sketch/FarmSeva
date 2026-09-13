import { Router } from 'express';
import { HealthController } from '../controllers/health-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';

const router = Router();

// Public Health & Readiness Endpoints
router.get('/health', HealthController.getHealth);
router.get('/ready', HealthController.getReady);

// Admin Production Operational Readiness & Infrastructure Dashboard
router.get(
  '/admin/health/dashboard',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  HealthController.getDashboard
);

export default router;
