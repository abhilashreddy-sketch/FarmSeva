import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplace-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';

const router = Router();

router.get('/categories', MarketplaceController.getCategories);
router.get('/products', MarketplaceController.getProducts);
router.get('/products/compare', MarketplaceController.compareProducts);
router.get(
  '/products/crop-recommendations',
  authenticateToken,
  requireRole(UserRole.FARMER),
  MarketplaceController.getProductsForFarmerCrops
);
router.get('/products/:slug', MarketplaceController.getProductBySlug);

export default router;
