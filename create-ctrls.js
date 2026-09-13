const fs = require('fs');
const path = require('path');

const mktCtrl = `import { Request, Response, NextFunction } from 'express';
import { MarketplaceService } from '../services/marketplace-service';
import { sendSuccess } from '../utils/api-response';
import { getProductsQuerySchema, compareProductsQuerySchema } from '../validations/marketplace-validation';

export class MarketplaceController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await MarketplaceService.getCategories();
      return sendSuccess(res, categories, 'Categories retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const queryParams = getProductsQuerySchema.parse(req.query);
      const result = await MarketplaceService.getProducts(queryParams);
      return sendSuccess(res, result, 'Products retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await MarketplaceService.getProductBySlug(slug);
      return sendSuccess(res, product, 'Product details retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getProductsForFarmerCrops(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await MarketplaceService.getProductsForFarmerCrops(userId);
      return sendSuccess(res, result, 'Crop-recommended products retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async compareProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { productIds } = compareProductsQuerySchema.parse(req.query);
      const ids = productIds.split(',').map((id) => id.trim()).filter(Boolean);
      const comparison = await MarketplaceService.compareProducts(ids);
      return sendSuccess(res, comparison, 'Product comparison retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
}
`;

const cartCtrl = `import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart-service';
import { sendSuccess } from '../utils/api-response';
import { addToCartSchema, updateCartItemSchema } from '../validations/marketplace-validation';

export class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const cart = await CartService.getCartByFarmerUserId(userId);
      return sendSuccess(res, cart, 'Cart retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const payload = addToCartSchema.parse(req.body);
      const cartItem = await CartService.addToCart(userId, payload);
      return sendSuccess(res, cartItem, 'Item added to cart successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { quantity } = updateCartItemSchema.parse(req.body);
      const result = await CartService.updateCartItem(userId, id, quantity);
      return sendSuccess(res, result, 'Cart item updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async removeCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await CartService.removeCartItem(userId, id);
      return sendSuccess(res, result, 'Cart item removed successfully');
    } catch (err) {
      next(err);
    }
  }

  static async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await CartService.clearCart(userId);
      return sendSuccess(res, result, 'Cart cleared successfully');
    } catch (err) {
      next(err);
    }
  }
}
`;

const sellerCtrl = `import { Request, Response, NextFunction } from 'express';
import { SellerMarketplaceService } from '../services/seller-marketplace-service';
import { sendSuccess } from '../utils/api-response';
import { createSellerListingSchema, updateSellerListingSchema } from '../validations/marketplace-validation';

export class SellerMarketplaceController {
  static async getListings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await SellerMarketplaceService.getSellerListings(userId);
      return sendSuccess(res, result, 'Seller listings retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createListing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const payload = createSellerListingSchema.parse(req.body);
      const listing = await SellerMarketplaceService.createListing(userId, payload);
      return sendSuccess(res, listing, 'Listing created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateListing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const payload = updateSellerListingSchema.parse(req.body);
      const listing = await SellerMarketplaceService.updateListing(userId, id, payload);
      return sendSuccess(res, listing, 'Listing updated successfully');
    } catch (err) {
      next(err);
    }
  }
}
`;

const adminCtrl = `import { Request, Response, NextFunction } from 'express';
import { AdminMarketplaceService } from '../services/admin-marketplace-service';
import { sendSuccess } from '../utils/api-response';
import { createCategorySchema, adminApproveProductSchema } from '../validations/marketplace-validation';

export class AdminMarketplaceController {
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createCategorySchema.parse(req.body);
      const category = await AdminMarketplaceService.createCategory(payload);
      return sendSuccess(res, category, 'Category created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async getPendingProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await AdminMarketplaceService.getPendingProducts();
      return sendSuccess(res, products, 'Pending products retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async reviewProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const { id } = req.params;
      const { status, rejectionReason } = adminApproveProductSchema.parse(req.body);
      const product = await AdminMarketplaceService.reviewProduct(adminUserId, id, status, rejectionReason);
      return sendSuccess(res, product, 'Product review recorded successfully');
    } catch (err) {
      next(err);
    }
  }
}
`;

fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'controllers', 'marketplace-controller.ts'), mktCtrl, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'controllers', 'cart-controller.ts'), cartCtrl, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'controllers', 'seller-marketplace-controller.ts'), sellerCtrl, 'utf8');
fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'controllers', 'admin-marketplace-controller.ts'), adminCtrl, 'utf8');
console.log('Created all 4 marketplace controllers.');
