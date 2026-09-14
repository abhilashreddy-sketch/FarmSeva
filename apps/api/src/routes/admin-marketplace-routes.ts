import { Router } from 'express';
import { AdminMarketplaceController } from '../controllers/admin-marketplace-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(UserRole.ADMIN));

router.post('/categories', AdminMarketplaceController.createCategory);
router.get('/pending-products', AdminMarketplaceController.getPendingProducts);
router.patch('/products/:id/review', AdminMarketplaceController.reviewProduct);
router.post('/products/:id/review', AdminMarketplaceController.reviewProduct);

export default router;

