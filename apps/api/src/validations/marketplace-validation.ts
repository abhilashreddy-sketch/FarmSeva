import { z } from 'zod';

export const getProductsQuerySchema = z.object({
  categoryId: z.string().optional(),
  crop: z.string().optional(),
  targetPest: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  toxicityClass: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'name']).optional().default('newest'),
  page: z.string().optional().transform((val) => {
    const parsed = val ? parseInt(val, 10) : 1;
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }),
  limit: z.string().optional().transform((val) => {
    const parsed = val ? parseInt(val, 10) : 12;
    if (isNaN(parsed) || parsed < 1) return 12;
    return parsed > 50 ? 50 : parsed;
  }),
});

export const compareProductsQuerySchema = z.object({
  productIds: z.string().min(1, 'At least one product ID is required'),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const adminApproveProductSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

export const createSellerListingSchema = z.object({
  shopId: z.string().min(1, 'Shop ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().min(1, 'Variant ID is required'),
  sellingPrice: z.number().positive('Price must be greater than 0'),
  quantityAvailable: z.number().int().nonnegative('Quantity must be non-negative'),
});

export const updateSellerListingSchema = z.object({
  sellingPrice: z.number().positive().optional(),
  quantityAvailable: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  sellerListingId: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be at least 0'),
});

export const createSellerProductSchema = z
  .object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    categoryId: z.string().min(1, 'Category is required'),
    brand: z.string().min(1, 'Brand name is required'),
    manufacturer: z.string().min(1, 'Manufacturer name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    activeIngredients: z.string().optional(),
    formulationType: z.string().optional(),
    targetPestsDiseases: z.string().optional(),
    targetCrops: z.string().optional(),
    dosageInstructions: z.string().optional(),
    safetyStorageInfo: z.string().optional(),
    packSize: z.number().positive('Pack size must be positive'),
    packUnit: z.string().min(1, 'Pack unit is required (e.g. ml, L, g, kg)'),
    sku: z.string().optional(),
    mrp: z.number().positive('MRP must be positive'),
    sellingPrice: z.number().positive('Selling price must be positive'),
    stockQuantity: z.number().int().nonnegative('Stock quantity cannot be negative').default(50),
    shopId: z.string().optional(),
    imageUrls: z.array(z.string()).optional().default([]),
    cgbRegistrationNo: z.string().optional(),
    toxicityClass: z.enum(['GREEN', 'BLUE', 'YELLOW', 'RED']).optional(),
  })
  .refine((data) => data.sellingPrice <= data.mrp, {
    message: 'Selling price cannot exceed Maximum Retail Price (MRP)',
    path: ['sellingPrice'],
  });


