import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/error-middleware';

const prisma = new PrismaClient();

export class SellerMarketplaceService {
  static async getSellerListings(userId: string) {
    const seller = await prisma.seller.findUnique({
      where: { userId },
      include: { shops: true },
    });

    if (!seller) {
      throw new ApiError('SELLER_NOT_FOUND', 'Seller profile not found', 404);
    }

    const listings = await prisma.sellerListing.findMany({
      where: { sellerId: seller.id },
      include: {
        shop: { select: { id: true, shopName: true, district: true } },
        product: { select: { id: true, name: true, slug: true, brand: true } },
        variant: { select: { id: true, packSize: true, packUnit: true, mrp: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      sellerId: seller.id,
      businessName: seller.businessName,
      shops: seller.shops,
      listings,
    };
  }

  static async createListing(
    userId: string,
    params: {
      shopId: string;
      productId: string;
      variantId: string;
      sellingPrice: number;
      quantityAvailable: number;
    }
  ) {
    const seller = await prisma.seller.findUnique({
      where: { userId },
      include: { shops: true },
    });

    if (!seller) {
      throw new ApiError('SELLER_NOT_FOUND', 'Seller profile not found', 404);
    }

    const shop = seller.shops.find((s) => s.id === params.shopId);
    if (!shop) {
      throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Shop does not belong to seller', 403);
    }

    const listing = await prisma.sellerListing.upsert({
      where: { shopId_variantId: { shopId: params.shopId, variantId: params.variantId } },
      update: {
        sellingPrice: params.sellingPrice,
        quantityAvailable: params.quantityAvailable,
        isActive: true,
      },
      create: {
        sellerId: seller.id,
        shopId: params.shopId,
        productId: params.productId,
        variantId: params.variantId,
        sellingPrice: params.sellingPrice,
        quantityAvailable: params.quantityAvailable,
      },
    });

    return listing;
  }

  static async updateListing(
    userId: string,
    listingId: string,
    params: { sellingPrice?: number; quantityAvailable?: number; isActive?: boolean }
  ) {
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) {
      throw new ApiError('SELLER_NOT_FOUND', 'Seller profile not found', 404);
    }

    const listing = await prisma.sellerListing.findUnique({ where: { id: listingId } });
    if (!listing) {
      throw new ApiError('LISTING_NOT_FOUND', 'Seller listing not found', 404);
    }

    if (listing.sellerId !== seller.id) {
      throw new ApiError('AUTH_OWNERSHIP_DENIED', 'Unauthorized: Listing does not belong to seller', 403);
    }

    const updated = await prisma.sellerListing.update({
      where: { id: listingId },
      data: params,
    });

    return updated;
  }
}
