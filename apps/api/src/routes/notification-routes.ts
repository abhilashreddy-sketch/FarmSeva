import { Router } from 'express';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';
import { NotificationController } from '../controllers/notification-controller';

const router = Router();

// Farmer Notification Endpoints
router.get('/notifications', authenticateToken, requireRole(UserRole.FARMER, UserRole.ADMIN), NotificationController.getNotifications);
router.patch('/notifications/read-all', authenticateToken, requireRole(UserRole.FARMER, UserRole.ADMIN), NotificationController.markAllAsRead);
router.patch('/notifications/:id/read', authenticateToken, requireRole(UserRole.FARMER, UserRole.ADMIN), NotificationController.markAsRead);

// Preferences Endpoints
router.get('/notifications/preferences', authenticateToken, NotificationController.getPreferences);
router.put('/notifications/preferences', authenticateToken, NotificationController.updatePreferences);

// Device Token Registration Endpoint
router.post('/notifications/device-token', authenticateToken, NotificationController.registerDeviceToken);

// Admin Emergency Broadcast Endpoint
router.post('/communications/emergency-broadcast', authenticateToken, requireRole(UserRole.ADMIN), NotificationController.dispatchEmergencyBroadcast);

// Public / Provider Webhook Endpoint
router.post('/communications/webhook/:provider', NotificationController.handleProviderWebhook);

export default router;
