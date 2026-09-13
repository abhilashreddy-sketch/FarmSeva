import { Router } from 'express';
import { FarmerController } from '../controllers/farmer-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';

const router = Router();

// Master Data (Public/Authenticated)
router.get('/crop-master-data', FarmerController.getMasterData);

// All Farmer domain endpoints require valid JWT authentication
router.use(authenticateToken);
router.use(requireRole(UserRole.FARMER, UserRole.ADMIN, UserRole.CALL_CENTER_AGENT));

// Profile
router.get('/profile', FarmerController.getProfile);
router.patch('/profile', FarmerController.updateProfile);

// Farms
router.get('/farms', FarmerController.getFarms);
router.post('/farms', FarmerController.createFarm);
router.get('/farms/:id', FarmerController.getFarmById);
router.patch('/farms/:id', FarmerController.updateFarm);
router.delete('/farms/:id', FarmerController.deleteFarm);

// Fields
router.post('/farms/:farmId/fields', FarmerController.createField);
router.patch('/fields/:id', FarmerController.updateField);
router.delete('/fields/:id', FarmerController.deleteField);

// Crops
router.get('/crops', FarmerController.getCrops);
router.post('/crops', FarmerController.createCrop);
router.patch('/crops/:id', FarmerController.updateCrop);
router.delete('/crops/:id', FarmerController.deleteCrop);
// Call Center Farmer Search
router.get('/call-center/farmers/search', FarmerController.searchFarmersForCallCenter);

export default router;
