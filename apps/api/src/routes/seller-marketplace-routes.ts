import { Router } from 'express';
import { SellerMarketplaceController } from '../controllers/seller-marketplace-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(UserRole.SELLER));

router.get('/listings', SellerMarketplaceController.getListings);
router.post('/listings', SellerMarketplaceController.createListing);
router.patch('/listings/:id', SellerMarketplaceController.updateListing);

export default router;
