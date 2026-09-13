import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/error-middleware';
import { CheckoutService } from './checkout-service';

const prisma = new PrismaClient();

export class FarmerLoyaltyService {
  /**
   * "Buy Again" Reorder workflow.
   * Creates a NEW order by validating current product status, variant selling price, and live stock.
   * Historical order is NEVER modified.
   */
  static async reorderPastOrder(pastOrderId: string, farmerUserId: string, shippingAddressId?: string): Promise<any> {
    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: farmerUserId },
    });
    if (!farmer) {
      throw new ApiError('FARMER_NOT_FOUND', 'Farmer profile not found', 404);
    }

    const pastOrder = await prisma.order.findUnique({
      where: { id: pastOrderId },
      include: { items: { include: { product: true } } },
    });

    if (!pastOrder) {
      throw new ApiError('ORDER_NOT_FOUND', `Past order ${pastOrderId} not found`, 404);
    }

    if (pastOrder.farmerId !== farmer.id) {
      throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Access to this order is denied', 403);
    }

    // Get active address or use past address
    const addressId = shippingAddressId || pastOrder.shippingAddressId;

    // Clear active cart & populate with validated reorder items
    let cart = await prisma.cart.findUnique({ where: { farmerId: farmer.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { farmerId: farmer.id } });
    } else {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    let reorderedItemsCount = 0;
    for (const item of pastOrder.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true, listings: true },
      });

      if (!product || product.status !== 'APPROVED') {
        continue; // Skip discontinued or unapproved products
      }

      const variant = product.variants[0];
      const listing = product.listings[0];

      if (!variant || !variant.isActive || variant.stockQuantity <= 0) {
        continue; // Skip out-of-stock items
      }

      const qty = Math.min(item.quantity, variant.stockQuantity);
      const currentPrice = Number(variant.sellingPrice);

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: variant.id,
          sellerListingId: listing?.id || null,
          quantity: qty,
          priceAtAddition: currentPrice,
        },
      });

      reorderedItemsCount++;
    }

    if (reorderedItemsCount === 0) {
      throw new ApiError(
        'REORDER_FAILED',
        'None of the items from the previous order are currently available in stock',
        400
      );
    }

    // Execute checkout to create a NEW order
    return await CheckoutService.processCheckout(farmerUserId, {
      addressId,
      paymentMethod: 'COD',
    });
  }

  /**
   * Favorites CRUD.
   */
  static async toggleFavorite(farmerUserId: string, favoriteType: 'PRODUCT' | 'SELLER', targetId: string): Promise<any> {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId: farmerUserId } });
    if (!farmer) throw new ApiError('FARMER_NOT_FOUND', 'Farmer profile not found', 404);

    const existing = await prisma.farmerFavorite.findUnique({
      where: {
        farmerId_favoriteType_targetId: {
          farmerId: farmer.id,
          favoriteType,
          targetId,
        },
      },
    });

    if (existing) {
      await prisma.farmerFavorite.delete({ where: { id: existing.id } });
      return { isFavorite: false, targetId };
    } else {
      const fav = await prisma.farmerFavorite.create({
        data: {
          farmerId: farmer.id,
          favoriteType,
          targetId,
        },
      });
      return { isFavorite: true, favorite: fav };
    }
  }

  static async getFavorites(farmerUserId: string): Promise<any[]> {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId: farmerUserId } });
    if (!farmer) return [];

    return await prisma.farmerFavorite.findMany({
      where: { farmerId: farmer.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
