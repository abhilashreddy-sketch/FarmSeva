import { Router } from 'express';
import { AdminUserController } from '../controllers/admin-user-controller';
import { AdminKycController } from '../controllers/admin-kyc-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';

const router = Router();

// All admin routes require valid authentication token and ADMIN role
router.use(authenticateToken);
router.use(requireRole(UserRole.ADMIN));

router.post('/users/call-center-agent', AdminUserController.createCallCenterAgent);
router.get('/users', AdminUserController.listUsers);
router.patch('/users/:id/status', AdminUserController.updateUserStatus);
router.patch('/sellers/:id/verify', AdminUserController.verifySeller);
router.get('/dashboard/metrics', AdminUserController.getDashboardMetrics);

// KYC Audit Console Routes
router.get('/kyc', AdminKycController.listApplications);
router.post('/kyc/:id/approve', AdminKycController.approve);
router.post('/kyc/:id/reject', AdminKycController.reject);
router.post('/kyc/:id/request-info', AdminKycController.requestInfo);

export default router;
