import { Router } from 'express';
import { PaymentController } from '../controllers/payment-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

router.post('/create-order', authenticateToken, PaymentController.createPaymentOrder);
router.post('/verify', authenticateToken, PaymentController.verifyPayment);
router.post('/webhook', PaymentController.handleWebhook);

export default router;
