import { Router } from 'express';
import multer from 'multer';
import { SellerMarketplaceController } from '../controllers/seller-marketplace-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(authenticateToken);
router.use(requireRole(UserRole.SELLER));

router.get('/listings', SellerMarketplaceController.getListings);
router.post('/listings', SellerMarketplaceController.createListing);
router.patch('/listings/:id', SellerMarketplaceController.updateListing);
router.post('/products', SellerMarketplaceController.createProduct);
router.post('/upload-image', upload.single('photo'), SellerMarketplaceController.uploadProductImage);

export default router;

