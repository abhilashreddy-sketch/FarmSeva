const fs = require('fs');
const path = require('path');

const mktRoutes = `import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplace-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@prisma/client';

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
`;

const cartRoutes = `import { Router } from 'express';
import { CartController } from '../controllers/cart-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(UserRole.FARMER));

router.get('/', CartController.getCart);
router.post('/items', CartController.addToCart);
router.patch('/items/:id', CartController.updateCartItem);
router.delete('/items/:id', CartController.removeCartItem);
router.delete('/', CartController.clearCart);

export default router;
`;

const sellerMktRoutes = `import { Router } from 'express';
import { SellerMarketplaceController } from '../controllers/seller-marketplace-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(UserRole.SELLER));

router.get('/listings', SellerMarketplaceController.getListings);
router.post('/listings', SellerMarketplaceController.createListing);
router.patch('/listings/:id', SellerMarketplaceController.updateListing);

export default router;
`;

const adminMktRoutes = `import { Router } from 'express';
import { AdminMarketplaceController } from '../controllers/admin-marketplace-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(UserRole.ADMIN));

router.post('/categories', AdminMarketplaceController.createCategory);
router.get('/pending-products', AdminMarketplaceController.getPendingProducts);
router.patch('/products/:id/review', AdminMarketplaceController.reviewProduct);

export default router;
`;

fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'routes', 'marketplace-routes.ts'), mktRoutes, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'routes', 'cart-routes.ts'), cartRoutes, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'routes', 'seller-marketplace-routes.ts'), sellerMktRoutes, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'routes', 'admin-marketplace-routes.ts'), adminMktRoutes, 'utf8');
console.log('Created all 4 marketplace routes.');
