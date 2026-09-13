import { Router } from 'express';
import { OrderController } from '../controllers/order-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';

const router = Router();

router.use(authenticateToken);

// Farmer Order Endpoints
router.post('/checkout', requireRole(UserRole.FARMER, UserRole.CALL_CENTER_AGENT), OrderController.checkout);
router.get('/farmer/orders', requireRole(UserRole.FARMER), OrderController.getFarmerOrders);
router.get('/farmer/orders/:id', requireRole(UserRole.FARMER), OrderController.getFarmerOrderById);
router.post('/farmer/orders/:id/cancel', requireRole(UserRole.FARMER), (req, res, next) => {
  req.body.status = 'CANCELLED';
  OrderController.updateOrderStatus(req, res, next);
});

// Seller Order Endpoints
router.get('/seller/orders', requireRole(UserRole.SELLER), OrderController.getSellerOrders);
router.get('/seller/orders/:id', requireRole(UserRole.SELLER), OrderController.getSellerOrderById);
router.patch('/seller/orders/:id/status', requireRole(UserRole.SELLER), OrderController.updateOrderStatus);

// Admin Order Endpoints
router.get('/admin/orders', requireRole(UserRole.ADMIN), OrderController.getAdminOrders);
router.patch('/admin/orders/:id/status', requireRole(UserRole.ADMIN), OrderController.updateOrderStatus);

export default router;
