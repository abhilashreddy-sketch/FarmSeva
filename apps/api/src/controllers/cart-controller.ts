import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart-service';
import { sendSuccess } from '../utils/api-response';
import { addToCartSchema, updateCartItemSchema } from '../validations/marketplace-validation';

export class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const cart = await CartService.getCartByFarmerUserId(userId);
      return sendSuccess(res, cart, 200);
    } catch (err) {
      next(err);
    }
  }

  static async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const payload = addToCartSchema.parse(req.body);
      const cartItem = await CartService.addToCart(userId, payload);
      return sendSuccess(res, cartItem, 201);
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
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async removeCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await CartService.removeCartItem(userId, id);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await CartService.clearCart(userId);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }
}
