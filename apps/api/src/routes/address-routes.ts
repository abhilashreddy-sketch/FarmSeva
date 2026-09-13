import { Router } from 'express';
import { AddressController } from '../controllers/address-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(UserRole.FARMER));

router.get('/', AddressController.getAddresses);
router.post('/', AddressController.createAddress);
router.get('/:id', AddressController.getAddressById);
router.patch('/:id', AddressController.updateAddress);
router.delete('/:id', AddressController.deleteAddress);

export default router;
