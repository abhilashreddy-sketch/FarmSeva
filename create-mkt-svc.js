const fs = require('fs');
const path = require('path');

const content = `import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/error-middleware';

const prisma = new PrismaClient();

export class MarketplaceService {
  static async getCategories() {
    const categories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return categories;
  }

  static async getProducts(params: {
    categoryId?: string;
    crop?: string;
    targetPest?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    toxicityClass?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name';
    page?: number;
    limit?: number;
  }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 12;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'APPROVED',
    };

    if (params.categoryId) {
      const subcategories = await prisma.category.findMany({
        where: { parentId: params.categoryId },
        select: { id: true },
      });
      const categoryIds = [params.categoryId, ...subcategories.map((c) => c.id)];
      where.categoryId = { in: categoryIds };
    }

    if (params.crop) {
      where.targetCrops = {
        contains: params.crop,
      };
    }

    if (params.targetPest) {
      where.targetPestsDiseases = {
        contains: params.targetPest,
      };
    }

    if (params.search && params.search.trim() !== '') {
      const term = params.search.trim();
      where.OR = [
        { name: { contains: term } },
        { brand: { contains: term } },
        { manufacturer: { contains: term } },
        { activeIngredients: { contains: term } },
        { targetPestsDiseases: { contains: term } },
        { targetCrops: { contains: term } },
      ];
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.sellingPrice = {};
      if (params.minPrice !== undefined) where.sellingPrice.gte = params.minPrice;
      if (params.maxPrice !== undefined) where.sellingPrice.lte = params.maxPrice;
    }

    if (params.toxicityClass) {
      where.compliance = {
        toxicityClass: { equals: params.toxicityClass },
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (params.sortBy === 'price_asc') {
      orderBy = { sellingPrice: 'asc' };
    } else if (params.sortBy === 'price_desc') {
      orderBy = { sellingPrice: 'desc' };
    } else if (params.sortBy === 'name') {
      orderBy = { name: 'asc' };
    } else if (params.sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { displayOrder: 'asc' } },
          compliance: true,
          variants: { where: { isActive: true } },
          seller: { select: { id: true, businessName: true, verificationStatus: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        compliance: true,
        variants: {
          where: { isActive: true },
          include: {
            listings: {
              where: { isActive: true },
              include: {
                shop: true,
                seller: { select: { id: true, businessName: true, pesticideLicenseNo: true } },
              },
            },
          },
        },
        seller: {
          select: {
            id: true,
            businessName: true,
            pesticideLicenseNo: true,
            verificationStatus: true,
            shops: true,
          },
        },
      },
    });

    if (!product) {
      throw new ApiError('PRODUCT_NOT_FOUND', 'Product with slug ' + slug + ' not found', 404);
    }

    return product;
  }

  static async getProductsForFarmerCrops(userId: string) {
    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId },
      include: {
        farms: {
          include: {
            fields: {
              include: {
                crops: {
                  where: { status: { in: ['PLANTED', 'GROWING', 'HARVEST_READY'] } },
                },
              },
            },
          },
        },
      },
    });

    if (!farmer) {
      throw new ApiError('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found', 404);
    }

    const cropNames = new Set<string>();
    for (const farm of farmer.farms) {
      for (const field of farm.fields) {
        for (const crop of field.crops) {
          if (crop.cropName) {
            cropNames.add(crop.cropName.trim());
          }
        }
      }
    }

    const activeCropsList = Array.from(cropNames);

    if (activeCropsList.length === 0) {
      const fallbackProducts = await prisma.product.findMany({
        where: { status: 'APPROVED' },
        take: 6,
        include: {
          category: { select: { name: true } },
          images: true,
          compliance: true,
        },
      });
      return {
        farmerCrops: [],
        recommendedProducts: fallbackProducts,
        message: 'No active crops found on your farms. Showing featured crop protection products.',
      };
    }

    const orConditions = activeCropsList.map((cropName) => ({
      targetCrops: { contains: cropName },
    }));

    const recommendedProducts = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        OR: orConditions,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: true,
        compliance: true,
        variants: { where: { isActive: true } },
      },
      take: 12,
    });

    return {
      farmerCrops: activeCropsList,
      recommendedProducts,
      message: 'Showing products recommended for your active crops: ' + activeCropsList.join(', '),
    };
  }

  static async compareProducts(productIds: string[]) {
    if (productIds.length === 0) {
      throw new ApiError('INVALID_INPUT', 'At least one product ID is required for comparison', 400);
    }
    if (productIds.length > 4) {
      throw new ApiError('LIMIT_EXCEEDED', 'Cannot compare more than 4 products simultaneously', 400);
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'APPROVED',
      },
      include: {
        category: { select: { name: true } },
        images: { where: { isPrimary: true } },
        compliance: true,
        variants: { where: { isActive: true } },
      },
    });

    return products;
  }
}
`;

fs.writeFileSync(path.join(__dirname, 'apps', 'api', 'src', 'services', 'marketplace-service.ts'), content, 'utf8');
console.log('Created marketplace-service.ts');
