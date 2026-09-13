import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/error-middleware';

const prisma = new PrismaClient();

export class CartService {
  static async getCartByFarmerUserId(userId: string) {
    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new ApiError('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found for this user', 404);
    }

    let cart = await prisma.cart.findUnique({
      where: { farmerId: farmer.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                brand: true,
                manufacturer: true,
                images: { where: { isPrimary: true } },
                compliance: { select: { toxicityClass: true, waitingPeriodDays: true } },
              },
            },
            variant: true,
            listing: {
              include: {
                shop: { select: { id: true, shopName: true, district: true, state: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { farmerId: farmer.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  brand: true,
                  manufacturer: true,
                  images: { where: { isPrimary: true } },
                  compliance: { select: { toxicityClass: true, waitingPeriodDays: true } },
                },
              },
              variant: true,
              listing: {
                include: {
                  shop: { select: { id: true, shopName: true, district: true, state: true } },
                },
              },
            },
          },
        },
      });
    }

    // Compute cart summary totals
    let totalItemsCount = 0;
    let totalAmount = 0;

    const formattedItems = cart.items.map((item) => {
      const itemPrice = Number(item.priceAtAddition);
      const subtotal = itemPrice * item.quantity;
      totalItemsCount += item.quantity;
      totalAmount += subtotal;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSlug: item.product.slug,
        brand: item.product.brand,
        imageUrl: item.product.images[0]?.imageUrl || null,
        toxicityClass: item.product.compliance?.toxicityClass || 'Green',
        waitingPeriodDays: item.product.compliance?.waitingPeriodDays || 0,
        variantId: item.variantId,
        packSize: item.variant ? Number(item.variant.packSize) : null,
        packUnit: item.variant ? item.variant.packUnit : null,
        shopId: item.listing?.shop?.id || null,
        shopName: item.listing?.shop?.shopName || 'Agri Retail Store',
        quantity: item.quantity,
        priceAtAddition: itemPrice,
        subtotal,
        createdAt: item.createdAt,
      };
    });

    return {
      cartId: cart.id,
      farmerId: farmer.id,
      items: formattedItems,
      summary: {
        totalItemsCount,
        totalAmount,
        currency: 'INR',
        disclaimerNotice: 'Prices locked at addition. Checkout enabled in Phase 5.',
      },
    };
  }

  static async addToCart(
    userId: string,
    params: {
      productId: string;
      variantId?: string;
      sellerListingId?: string;
      quantity: number;
    }
  ) {
    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new ApiError('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found for this user', 404);
    }

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      include: { variants: true, listings: true },
    });

    if (!product || product.status !== 'APPROVED') {
      throw new ApiError('PRODUCT_NOT_FOUND', 'Product not available or unapproved', 404);
    }

    // Determine variant & price
    let targetVariantId = params.variantId;
    let priceToCharge = Number(product.sellingPrice);

    if (targetVariantId) {
      const variant = product.variants.find((v) => v.id === targetVariantId);
      if (!variant) {
        throw new ApiError('VARIANT_NOT_FOUND', 'Product pack size variant not found', 404);
      }
      priceToCharge = Number(variant.sellingPrice);
    } else if (product.variants.length > 0) {
      targetVariantId = product.variants[0].id;
      priceToCharge = Number(product.variants[0].sellingPrice);
    }

    // Ensure farmer cart exists
    let cart = await prisma.cart.findUnique({ where: { farmerId: farmer.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { farmerId: farmer.id } });
    }

    // Check if item already exists in cart for this product and variant
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: params.productId,
        variantId: targetVariantId || undefined,
      },
    });

    if (existingItem) {
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + params.quantity,
          priceAtAddition: priceToCharge,
        },
      });
      return updatedItem;
    } else {
      const newItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: params.productId,
          variantId: targetVariantId || null,
          sellerListingId: params.sellerListingId || null,
          quantity: params.quantity,
          priceAtAddition: priceToCharge,
        },
      });
      return newItem;
    }
  }

  static async updateCartItem(userId: string, cartItemId: string, quantity: number) {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) {
      throw new ApiError('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found', 404);
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item) {
      throw new ApiError('CART_ITEM_NOT_FOUND', 'Cart item not found', 404);
    }

    if (item.cart.farmerId !== farmer.id) {
      throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Access to this cart item is denied', 403);
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      return { message: 'Item removed from cart' };
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return updated;
  }

  static async removeCartItem(userId: string, cartItemId: string) {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) {
      throw new ApiError('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found', 404);
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item) {
      throw new ApiError('CART_ITEM_NOT_FOUND', 'Cart item not found', 404);
    }

    if (item.cart.farmerId !== farmer.id) {
      throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Access to this cart item is denied', 403);
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return { message: 'Item removed from cart successfully' };
  }

  static async clearCart(userId: string) {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) {
      throw new ApiError('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found', 404);
    }

    const cart = await prisma.cart.findUnique({ where: { farmerId: farmer.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { message: 'Cart cleared successfully' };
  }
}
