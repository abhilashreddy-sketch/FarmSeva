import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/error-middleware';
import { logAuditEvent } from '../utils/audit-logger';

const prisma = new PrismaClient();

export class AdminMarketplaceService {
  static async createCategory(params: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    imageUrl?: string;
  }) {
    const existing = await prisma.category.findUnique({ where: { slug: params.slug } });
    if (existing) {
      throw new ApiError('CATEGORY_EXISTS', 'Category slug already exists', 400);
    }

    const category = await prisma.category.create({
      data: {
        name: params.name,
        slug: params.slug,
        description: params.description || null,
        parentId: params.parentId || null,
        imageUrl: params.imageUrl || null,
      },
    });

    return category;
  }

  static async getPendingProducts() {
    const products = await prisma.product.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        category: { select: { name: true } },
        seller: { select: { id: true, businessName: true, pesticideLicenseNo: true } },
        compliance: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products;
  }

  static async reviewProduct(
    adminUserId: string,
    productId: string,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new ApiError('PRODUCT_NOT_FOUND', 'Product not found', 404);
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason || 'Rejected by admin' : null,
      },
    });

    await logAuditEvent({
      userId: adminUserId,
      action: status === 'APPROVED' ? 'PRODUCT_APPROVED' : 'PRODUCT_REJECTED',
      entityName: 'Product',
      entityId: productId,
      changesJson: { productId, productName: product.name, status, rejectionReason },
    });

    return updated;
  }
}
