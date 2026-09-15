import { Router } from 'express';
import { PublicController } from '../controllers/public-controller';

const router = Router();

// Public Platform Statistics Endpoint (Rate limited, cached, aggregate data only)
router.get('/public/stats', PublicController.getPublicStats);

export default router;
