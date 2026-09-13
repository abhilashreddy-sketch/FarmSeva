import { Router } from 'express';
import { BusinessController } from '../controllers/business-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';

const router = Router();

router.use(authenticateToken);

// Admin Business Configuration & Financial Management
router.get('/admin/business/settings', requireRole(UserRole.ADMIN), BusinessController.getSettings);
router.put('/admin/business/settings', requireRole(UserRole.ADMIN), BusinessController.updateSettings);
router.post('/admin/settlements/process', requireRole(UserRole.ADMIN), BusinessController.processSettlements);
router.get('/admin/financial/reconciliation', requireRole(UserRole.ADMIN), BusinessController.runReconciliation);
router.get('/admin/business/revenue', requireRole(UserRole.ADMIN), BusinessController.getRevenueMetrics);
router.get('/admin/business/reports/export', requireRole(UserRole.ADMIN), BusinessController.exportCSVReport);

// Seller Analytics & Payout History
router.get('/seller/analytics/dashboard', requireRole(UserRole.SELLER), BusinessController.getSellerDashboard);

// Farmer Loyalty, Coupons & Reorder
router.post('/promotions/validate', requireRole(UserRole.FARMER), BusinessController.validateCoupon);
router.post('/orders/farmer/reorder/:orderId', requireRole(UserRole.FARMER), BusinessController.reorder);
router.post('/farmer/favorites', requireRole(UserRole.FARMER), BusinessController.toggleFavorite);
router.get('/farmer/favorites', requireRole(UserRole.FARMER), BusinessController.getFavorites);

export default router;
