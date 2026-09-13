const fs = require('fs');
const path = require('path');

// CONTROLLERS
const addrCtrl = `import { Request, Response, NextFunction } from 'express';
import { AddressService } from '../services/address-service';
import { sendSuccess } from '../utils/api-response';
import { createAddressSchema, updateAddressSchema } from '../validations/address-validation';

export class AddressController {
  static async createAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const payload = createAddressSchema.parse(req.body);
      const address = await AddressService.createAddress(userId, payload);
      return sendSuccess(res, address, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const addresses = await AddressService.getAddresses(userId);
      return sendSuccess(res, addresses, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getAddressById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const address = await AddressService.getAddressById(userId, id);
      return sendSuccess(res, address, 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const payload = updateAddressSchema.parse(req.body);
      const address = await AddressService.updateAddress(userId, id, payload);
      return sendSuccess(res, address, 200);
    } catch (err) {
      next(err);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await AddressService.deleteAddress(userId, id);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }
}
`;

const orderCtrl = `import { Request, Response, NextFunction } from 'express';
import { CheckoutService } from '../services/checkout-service';
import { OrderService } from '../services/order-service';
import { sendSuccess } from '../utils/api-response';
import { checkoutSchema, updateOrderStatusSchema } from '../validations/order-validation';

export class OrderController {
  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const payload = checkoutSchema.parse(req.body);
      const result = await CheckoutService.processCheckout(userId, payload);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getFarmerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const orders = await OrderService.getFarmerOrders(userId);
      return sendSuccess(res, orders, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getFarmerOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const order = await OrderService.getFarmerOrderById(userId, id);
      return sendSuccess(res, order, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getSellerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const orders = await OrderService.getSellerOrders(userId);
      return sendSuccess(res, orders, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getSellerOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const order = await OrderService.getSellerOrderById(userId, id);
      return sendSuccess(res, order, 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { id } = req.params;
      const { status, cancellationReason, rejectionReason } = updateOrderStatusSchema.parse(req.body);
      const order = await OrderService.updateOrderStatus(userId, userRole, id, status, {
        cancellationReason,
        rejectionReason,
      });
      return sendSuccess(res, order, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getAdminOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.getAdminOrders();
      return sendSuccess(res, orders, 200);
    } catch (err) {
      next(err);
    }
  }
}
`;

const payCtrl = `import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment-service';
import { sendSuccess } from '../utils/api-response';
import { verifyPaymentSchema } from '../validations/payment-validation';

export class PaymentController {
  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { orderId } = req.body;
      const payload = verifyPaymentSchema.parse(req.body);
      const result = await PaymentService.verifyAndProcessOnlinePayment(userId, {
        orderId,
        ...payload,
      });
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = JSON.stringify(req.body);
      const result = await PaymentService.processWebhook(rawBody, signature);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }
}
`;

const delCtrl = `import { Request, Response, NextFunction } from 'express';
import { DeliveryService } from '../services/delivery-service';
import { sendSuccess } from '../utils/api-response';
import { assignDeliverySchema, updateDeliveryStatusSchema } from '../validations/order-validation';

export class DeliveryController {
  static async getAssignedDeliveries(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const deliveries = await DeliveryService.getAssignedDeliveries(userId);
      return sendSuccess(res, deliveries, 200);
    } catch (err) {
      next(err);
    }
  }

  static async assignDeliveryPartner(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const { deliveryId } = req.params;
      const { deliveryPartnerId } = assignDeliverySchema.parse(req.body);
      const result = await DeliveryService.assignDeliveryPartner(adminUserId, deliveryId, deliveryPartnerId);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateDeliveryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { id } = req.params;
      const { status, deliveryOtp, notes } = updateDeliveryStatusSchema.parse(req.body);
      const result = await DeliveryService.updateDeliveryStatus(userId, userRole, id, status, deliveryOtp, notes);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }
}
`;

fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'controllers', 'address-controller.ts'), addrCtrl, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'controllers', 'order-controller.ts'), orderCtrl, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'controllers', 'payment-controller.ts'), payCtrl, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'controllers', 'delivery-controller.ts'), delCtrl, 'utf8');

// ROUTES
const addrRoutes = `import { Router } from 'express';
import { AddressController } from '../controllers/address-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(UserRole.FARMER));

router.get('/', AddressController.getAddresses);
router.post('/', AddressController.createAddress);
router.get('/:id', AddressController.getAddressById);
router.patch('/:id', AddressController.updateAddress);
router.delete('/:id', AddressController.deleteAddress);

export default router;
`;

const orderRoutes = `import { Router } from 'express';
import { OrderController } from '../controllers/order-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@prisma/client';

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
`;

const payRoutes = `import { Router } from 'express';
import { PaymentController } from '../controllers/payment-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

router.post('/verify', authenticateToken, PaymentController.verifyPayment);
router.post('/webhook', PaymentController.handleWebhook);

export default router;
`;

const delRoutes = `import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery-controller';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireRole } from '../middleware/role-middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.get('/delivery/orders', requireRole(UserRole.DELIVERY_PARTNER), DeliveryController.getAssignedDeliveries);
router.patch('/delivery/orders/:id/status', requireRole(UserRole.DELIVERY_PARTNER, UserRole.ADMIN), DeliveryController.updateDeliveryStatus);
router.post('/admin/deliveries/:deliveryId/assign', requireRole(UserRole.ADMIN), DeliveryController.assignDeliveryPartner);

export default router;
`;

fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'routes', 'address-routes.ts'), addrRoutes, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'routes', 'order-routes.ts'), orderRoutes, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'routes', 'payment-routes.ts'), payRoutes, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'routes', 'delivery-routes.ts'), delRoutes, 'utf8');

console.log('Created all Phase 5 controllers and routes.');
