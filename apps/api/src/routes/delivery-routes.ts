import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';

const router = Router();

router.use(authenticateToken);

router.get('/delivery/profile', requireRole(UserRole.DELIVERY_PARTNER), DeliveryController.getProfile);
router.patch('/delivery/status', requireRole(UserRole.DELIVERY_PARTNER), DeliveryController.toggleStatus);
router.post('/delivery/location', requireRole(UserRole.DELIVERY_PARTNER), DeliveryController.updateLocation);
router.get('/delivery/earnings', requireRole(UserRole.DELIVERY_PARTNER), DeliveryController.getEarnings);
router.get('/delivery/history', requireRole(UserRole.DELIVERY_PARTNER), DeliveryController.getHistory);
router.post('/delivery/support', requireRole(UserRole.DELIVERY_PARTNER), DeliveryController.createSupportTicket);

router.get('/delivery/orders', requireRole(UserRole.DELIVERY_PARTNER), DeliveryController.getAssignedDeliveries);
router.patch('/delivery/orders/:id/status', requireRole(UserRole.DELIVERY_PARTNER, UserRole.ADMIN), DeliveryController.updateDeliveryStatus);
router.post('/admin/deliveries/:deliveryId/assign', requireRole(UserRole.ADMIN), DeliveryController.assignDeliveryPartner);

export default router;
