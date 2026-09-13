import { Router } from 'express';
import { CartController } from '../controllers/cart-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(UserRole.FARMER));

router.get('/', CartController.getCart);
router.post('/items', CartController.addToCart);
router.patch('/items/:id', CartController.updateCartItem);
router.delete('/items/:id', CartController.removeCartItem);
router.delete('/', CartController.clearCart);

export default router;
