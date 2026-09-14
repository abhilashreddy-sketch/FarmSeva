import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/error-middleware';

const prisma = new PrismaClient();

export class SellerMarketplaceService {
  static async verifySellerStatus(userId: string) {
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) {
      throw new ApiError('SELLER_NOT_FOUND', 'Seller profile not found', 404);
    }
    if (seller.verificationStatus !== 'APPROVED') {
      throw new ApiError('SELLER_NOT_VERIFIED', 'Only verified sellers can manage product catalog items.', 403);
    }
    return seller;
  }
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

  static async createProduct(
    userId: string,
    params: {
      name: string;
      categoryId: string;
      brand: string;
      manufacturer: string;
      description: string;
      activeIngredients?: string;
      formulationType?: string;
      targetPestsDiseases?: string;
      targetCrops?: string;
      dosageInstructions?: string;
      safetyStorageInfo?: string;
      packSize: number;
      packUnit: string;
      sku?: string;
      mrp: number;
      sellingPrice: number;
      stockQuantity?: number;
      shopId?: string;
      imageUrls?: string[];
      cgbRegistrationNo?: string;
      toxicityClass?: 'GREEN' | 'BLUE' | 'YELLOW' | 'RED';
    }
  ) {
    const seller = await prisma.seller.findUnique({
      where: { userId },
      include: { shops: true },
    });

    if (!seller) {
      throw new ApiError('SELLER_NOT_FOUND', 'Seller profile not found', 404);
    }

    if (seller.verificationStatus !== 'APPROVED') {
      throw new ApiError('SELLER_NOT_VERIFIED', 'Only verified sellers with approved status can publish products into the catalog.', 403);
    }

    const operatingShop = params.shopId
      ? seller.shops.find((s) => s.id === params.shopId && s.isOperating)
      : seller.shops.find((s) => s.isOperating);

    if (!operatingShop) {
      throw new ApiError('NO_OPERATING_SHOP', 'Seller must have an active operating shop to list products.', 400);
    }

    const category = await prisma.category.findUnique({ where: { id: params.categoryId } });
    if (!category || !category.isActive) {
      throw new ApiError('CATEGORY_NOT_FOUND', 'Selected category does not exist or is inactive', 404);
    }

    // Business Rule: Selling price cannot exceed MRP
    if (params.sellingPrice > params.mrp) {
      throw new ApiError('INVALID_PRICING', 'Selling price cannot exceed Maximum Retail Price (MRP).', 400);
    }

    if (params.sellingPrice <= 0 || params.mrp <= 0) {
      throw new ApiError('INVALID_PRICING', 'MRP and selling price must be greater than zero.', 400);
    }

    if (params.stockQuantity !== undefined && params.stockQuantity < 0) {
      throw new ApiError('INVALID_STOCK', 'Stock quantity cannot be negative.', 400);
    }

    // Business Rule: SKU uniqueness check
    if (params.sku && params.sku.trim() !== '') {
      const existingSku = await prisma.productVariant.findFirst({ where: { sku: params.sku.trim() } });
      if (existingSku) {
        throw new ApiError('DUPLICATE_SKU', `SKU '${params.sku}' already exists. SKU must be unique.`, 400);
      }
    }

    // Sanitize image URLs (Limit to max 5, reject non-http/https/local storage strings)
    const validImageUrls: string[] = [];
    if (params.imageUrls && params.imageUrls.length > 0) {
      if (params.imageUrls.length > 5) {
        throw new ApiError('TOO_MANY_IMAGES', 'Maximum 5 product photos are allowed per product.', 400);
      }

      for (const imgUrl of params.imageUrls) {
        const trimmed = imgUrl.trim();
        if (trimmed.startsWith('/uploads/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          validImageUrls.push(trimmed);
        } else {
          throw new ApiError('INVALID_IMAGE_URL', `Invalid product image storage path: ${trimmed}`, 400);
        }
      }
    }

    const baseSlug = params.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    // Database Transaction: Creates Product (PENDING_APPROVAL), ProductVariant, ProductImage, ProductCompliance, and SellerListing
    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          sellerId: seller.id,
          categoryId: params.categoryId,
          name: params.name.trim(),
          slug: uniqueSlug,
          brand: params.brand.trim(),
          manufacturer: params.manufacturer.trim(),
          description: params.description.trim(),
          activeIngredients: params.activeIngredients?.trim() || null,
          formulationType: params.formulationType?.trim() || null,
          targetPestsDiseases: params.targetPestsDiseases?.trim() || null,
          targetCrops: params.targetCrops?.trim() || null,
          dosageInstructions: params.dosageInstructions?.trim() || null,
          safetyStorageInfo: params.safetyStorageInfo?.trim() || null,
          packSize: params.packSize,
          packUnit: params.packUnit,
          mrp: params.mrp,
          sellingPrice: params.sellingPrice,
          status: 'PENDING_APPROVAL', // Seller submissions default to PENDING_APPROVAL
          isDemo: false,
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          productId: createdProduct.id,
          packSize: params.packSize,
          packUnit: params.packUnit,
          sku: params.sku?.trim() || null,
          mrp: params.mrp,
          sellingPrice: params.sellingPrice,
          stockQuantity: params.stockQuantity !== undefined ? params.stockQuantity : 50,
          isActive: true,
        },
      });

      for (let i = 0; i < validImageUrls.length; i++) {
        await tx.productImage.create({
          data: {
            productId: createdProduct.id,
            imageUrl: validImageUrls[i],
            altText: `${params.name.trim()} photo ${i + 1}`,
            isPrimary: i === 0,
            displayOrder: i,
          },
        });
      }

      if (params.cgbRegistrationNo || params.toxicityClass) {
        await tx.productCompliance.create({
          data: {
            productId: createdProduct.id,
            cgbRegistrationNo: params.cgbRegistrationNo?.trim() || null,
            toxicityClass: params.toxicityClass || 'GREEN',
            verificationStatus: 'PENDING',
          },
        });
      }

      await tx.sellerListing.create({
        data: {
          sellerId: seller.id,
          shopId: operatingShop.id,
          productId: createdProduct.id,
          variantId: variant.id,
          sellingPrice: params.sellingPrice,
          quantityAvailable: params.stockQuantity !== undefined ? params.stockQuantity : 50,
          isActive: true,
        },
      });

      return tx.product.findUnique({
        where: { id: createdProduct.id },
        include: {
          images: true,
          variants: true,
          category: true,
          compliance: true,
          seller: true,
        },
      });
    });

    return product;
  }
}

