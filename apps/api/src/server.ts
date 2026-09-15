import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import { env } from './config/env';
import authRoutes from './routes/auth-routes';
import adminUserRoutes from './routes/admin-user-routes';
import farmerRoutes from './routes/farmer-routes';
import marketplaceRoutes from './routes/marketplace-routes';
import cartRoutes from './routes/cart-routes';
import sellerMarketplaceRoutes from './routes/seller-marketplace-routes';
import adminMarketplaceRoutes from './routes/admin-marketplace-routes';
import addressRoutes from './routes/address-routes';
import orderRoutes from './routes/order-routes';
import paymentRoutes from './routes/payment-routes';
import deliveryRoutes from './routes/delivery-routes';
import cropProblemRoutes from './routes/crop-problem-routes';
import consultationRoutes from './routes/consultation-routes';
import expertRoutes from './routes/expert-routes';
import notificationRoutes from './routes/notification-routes';
import businessRoutes from './routes/business-routes';
import healthRoutes from './routes/health-routes';
import publicRoutes from './routes/public-routes';
import kycRoutes from './routes/kyc-routes';
import cropDoctorRoutes from './routes/crop-doctor-routes';
import { FarmerController } from './controllers/farmer-controller';
import { HealthController } from './controllers/health-controller';
import { authenticateToken } from './middleware/auth-middleware';
import { requireRole } from './middleware/role-middleware';
import { UserRole } from '@farm-seva/shared';
import { authLimiter, checkoutLimiter, globalLimiter } from './middleware/rate-limiter-middleware';
import { globalErrorHandler } from './middleware/error-middleware';
import { sendError } from './utils/api-response';
import { Logger } from './utils/logger';

export const app = express();

// Request ID & Request Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);

  const startTime = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    Logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms`, {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    });
  });
  next();
});

// Security & Request Parsing Middleware
app.use(helmet());

// Production CORS Hardening Policy
const allowedCorsOrigins = env.NODE_ENV === 'production' ? env.CORS_ORIGINS : '*';
app.use(
  cors({
    origin: allowedCorsOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply Rate Limiters
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/orders/checkout', checkoutLimiter);
app.use('/api/v1/payments', checkoutLimiter);
app.use(globalLimiter);

// Root Level Health & Readiness Probes for Kubernetes / Cloud Load Balancers
app.get('/health', HealthController.getHealth);
app.get('/ready', HealthController.getReady);

// API V1 Route Mounts & Legacy Alias Mounts
app.use('/api/v1', healthRoutes);
app.use('/api/v1', publicRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/v1/crop-doctor', cropDoctorRoutes);
app.use('/api/v1/admin', adminUserRoutes);
app.use('/api/v1/admin/marketplace', adminMarketplaceRoutes);
app.use('/api/v1/farmer', farmerRoutes);
app.use('/api/v1/farmer/addresses', addressRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/seller/marketplace', sellerMarketplaceRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1', deliveryRoutes);
app.use('/api/v1', cropProblemRoutes);
app.use('/api/v1', consultationRoutes);
app.use('/api/v1', expertRoutes);
app.use('/api/v1', notificationRoutes);
app.use('/api/v1', businessRoutes);
app.get('/api/v1/call-center/farmers/search', authenticateToken, requireRole(UserRole.CALL_CENTER_AGENT, UserRole.ADMIN), FarmerController.searchFarmersForCallCenter);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  return sendError(res, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`, 404);
});

// Global Error Handler
app.use(globalErrorHandler);

// Graceful Shutdown & Server Startup Execution
let server: any = null;
if (require.main === module) {
  server = app.listen(env.PORT, () => {
    Logger.info(`🚀 FARM SEVA REST API running on http://localhost:${env.PORT} [Env: ${env.NODE_ENV}]`);
  });

  const shutdown = (signal: string) => {
    Logger.info(`Received ${signal}. Shutting down gracefully...`);
    if (server) {
      server.close(() => {
        Logger.info('HTTP server closed. Exiting process.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
