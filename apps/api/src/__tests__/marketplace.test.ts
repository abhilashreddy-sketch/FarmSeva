import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '@farm-seva/shared';
import bcrypt from 'bcryptjs';
import { seedCategories } from '../../../../packages/database/seed-categories';

const prisma = new PrismaClient();

describe('FARM SEVA Marketplace Hardening Test Suite', () => {
  let adminToken: string;
  let adminUserId: string;

  let sellerApprovedToken: string;
  let sellerApprovedUserId: string;
  let sellerApprovedId: string;
  let shopApprovedId: string;

  let sellerPendingToken: string;
  let sellerPendingUserId: string;
  let sellerPendingId: string;

  let categoryId: string;
  let pendingProductId: string;
  let rejectedProductId: string;
  let approvedProductId: string;

  beforeAll(async () => {
    // Seed generic categories idempotently
    await seedCategories();
    const categories = await prisma.category.findMany();
    expect(categories.length).toBeGreaterThan(0);
    categoryId = categories[0].id;

    // Clean up test data
    await prisma.sellerListing.deleteMany({ where: { product: { name: { contains: 'Hardened Test Product' } } } });
    await prisma.productImage.deleteMany({ where: { product: { name: { contains: 'Hardened Test Product' } } } });
    await prisma.productCompliance.deleteMany({ where: { product: { name: { contains: 'Hardened Test Product' } } } });
    await prisma.productVariant.deleteMany({ where: { product: { name: { contains: 'Hardened Test Product' } } } });
    await prisma.product.deleteMany({ where: { name: { contains: 'Hardened Test Product' } } });

    await prisma.shop.deleteMany({ where: { shopName: { in: ['Approved Shop', 'Pending Shop'] } } });
    await prisma.seller.deleteMany({ where: { pesticideLicenseNo: { in: ['AP/APPROVED/123', 'AP/PENDING/456'] } } });
    await prisma.user.deleteMany({ where: { phone: { in: ['9900011111', '9900022222', '9900033333'] } } });

    const passHash = await bcrypt.hash('TestPass123!', 12);

    // 1. Create Admin User
    const adminUser = await prisma.user.create({
      data: {
        phone: '9900011111',
        fullName: 'Marketplace Admin Tester',
        email: 'admin.tester@farmseva.com',
        passwordHash: passHash,
        role: UserRole.ADMIN,
        status: 'ACTIVE',
      },
    });
    adminUserId = adminUser.id;

    const adminLogin = await request(app).post('/api/v1/auth/login').send({ phone: '9900011111', password: 'TestPass123!' });
    adminToken = adminLogin.body.data.accessToken;

    // 2. Create Approved Seller
    const sellerApprovedUser = await prisma.user.create({
      data: {
        phone: '9900022222',
        fullName: 'Approved Dealer User',
        email: 'approved.dealer@farmseva.com',
        passwordHash: passHash,
        role: UserRole.SELLER,
        status: 'ACTIVE',
      },
    });
    sellerApprovedUserId = sellerApprovedUser.id;

    const sellerApproved = await prisma.seller.create({
      data: {
        userId: sellerApprovedUserId,
        businessName: 'Approved Krishi Seva',
        pesticideLicenseNo: 'AP/APPROVED/123',
        verificationStatus: 'APPROVED',
        shops: {
          create: {
            shopName: 'Approved Shop',
            addressLine: 'APMC Market',
            district: 'Guntur',
            state: 'Andhra Pradesh',
            taluk: 'Guntur',
            pincode: '522001',
            contactPhone: '9900022222',
            isOperating: true,
          },
        },
      },
      include: { shops: true },
    });
    sellerApprovedId = sellerApproved.id;
    shopApprovedId = sellerApproved.shops[0].id;

    const sellerApprovedLogin = await request(app).post('/api/v1/auth/login').send({ phone: '9900022222', password: 'TestPass123!' });
    sellerApprovedToken = sellerApprovedLogin.body.data.accessToken;

    // 3. Create Pending/Unverified Seller
    const sellerPendingUser = await prisma.user.create({
      data: {
        phone: '9900033333',
        fullName: 'Unverified Dealer User',
        email: 'unverified.dealer@farmseva.com',
        passwordHash: passHash,
        role: UserRole.SELLER,
        status: 'ACTIVE',
      },
    });
    sellerPendingUserId = sellerPendingUser.id;

    const sellerPending = await prisma.seller.create({
      data: {
        userId: sellerPendingUserId,
        businessName: 'Unverified Krishi Kendra',
        pesticideLicenseNo: 'AP/PENDING/456',
        verificationStatus: 'SUBMITTED',
      },
    });
    sellerPendingId = sellerPending.id;

    const sellerPendingLogin = await request(app).post('/api/v1/auth/login').send({ phone: '9900033333', password: 'TestPass123!' });
    sellerPendingToken = sellerPendingLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.sellerListing.deleteMany({ where: { sellerId: sellerApprovedId } });
    await prisma.productImage.deleteMany({ where: { product: { sellerId: sellerApprovedId } } });
    await prisma.productVariant.deleteMany({ where: { product: { sellerId: sellerApprovedId } } });
    await prisma.productCompliance.deleteMany({ where: { product: { sellerId: sellerApprovedId } } });
    await prisma.product.deleteMany({ where: { sellerId: sellerApprovedId } });

    await prisma.shop.deleteMany({ where: { id: shopApprovedId } });
    await prisma.seller.deleteMany({ where: { id: sellerApprovedId } });
    await prisma.seller.deleteMany({ where: { id: sellerPendingId } });

    await prisma.user.deleteMany({ where: { id: adminUserId } });
    await prisma.user.deleteMany({ where: { id: sellerApprovedUserId } });
    await prisma.user.deleteMany({ where: { id: sellerPendingUserId } });

    await prisma.$disconnect();
  });

  test('1. Category Seed Idempotency', async () => {
    const initialCount = await prisma.category.count();
    await seedCategories();
    const finalCount = await prisma.category.count();
    expect(finalCount).toEqual(initialCount);
  });

  test('2. Unverified Seller product submission is rejected with 403', async () => {
    const res = await request(app)
      .post('/api/v1/seller/marketplace/products')
      .set('Authorization', `Bearer ${sellerPendingToken}`)
      .send({
        name: 'Hardened Test Product Unverified',
        categoryId,
        brand: 'Generic',
        manufacturer: 'Generic Ltd',
        description: 'Testing unverified seller rejection rules',
        packSize: 1,
        packUnit: 'L',
        mrp: 500,
        sellingPrice: 450,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SELLER_NOT_VERIFIED');
  });

  test('3. Business Rule Validation: sellingPrice > MRP fails with 400', async () => {
    const res = await request(app)
      .post('/api/v1/seller/marketplace/products')
      .set('Authorization', `Bearer ${sellerApprovedToken}`)
      .send({
        name: 'Hardened Test Product Price Invalid',
        categoryId,
        brand: 'FMC',
        manufacturer: 'FMC India',
        description: 'Testing price validation rules',
        packSize: 1,
        packUnit: 'L',
        mrp: 500,
        sellingPrice: 600, // Invalid: sellingPrice > MRP
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('4. Business Rule Validation: Negative stock quantity fails with 400', async () => {
    const res = await request(app)
      .post('/api/v1/seller/marketplace/products')
      .set('Authorization', `Bearer ${sellerApprovedToken}`)
      .send({
        name: 'Hardened Test Product Stock Invalid',
        categoryId,
        brand: 'FMC',
        manufacturer: 'FMC India',
        description: 'Testing stock validation rules',
        packSize: 1,
        packUnit: 'L',
        mrp: 500,
        sellingPrice: 450,
        stockQuantity: -10, // Invalid negative stock
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('5. Valid Seller Product submission creates Product with PENDING_APPROVAL status', async () => {
    const res = await request(app)
      .post('/api/v1/seller/marketplace/products')
      .set('Authorization', `Bearer ${sellerApprovedToken}`)
      .send({
        name: 'Hardened Test Product Bio Neem',
        categoryId,
        brand: 'Kisan Bio',
        manufacturer: 'Kisan Chemicals',
        description: 'Eco friendly neem formulation for sucking pest management in chilli and tomato',
        activeIngredients: 'Azadirachtin 10000 ppm',
        targetCrops: 'Chilli, Tomato, Paddy',
        targetPestsDiseases: 'Whitefly, Thrips, Aphids',
        packSize: 1,
        packUnit: 'L',
        sku: 'SKU-NEEM-TEST-001',
        mrp: 1200,
        sellingPrice: 990,
        stockQuantity: 50,
        imageUrls: ['/uploads/products/product_test_neem.jpg'],
        toxicityClass: 'GREEN',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING_APPROVAL');
    expect(res.body.data.name).toBe('Hardened Test Product Bio Neem');
    expect(res.body.data.variants[0].sku).toBe('SKU-NEEM-TEST-001');

    pendingProductId = res.body.data.id;
  });

  test('6. Duplicate SKU submission fails with 400', async () => {
    const res = await request(app)
      .post('/api/v1/seller/marketplace/products')
      .set('Authorization', `Bearer ${sellerApprovedToken}`)
      .send({
        name: 'Hardened Test Product Duplicate SKU',
        categoryId,
        brand: 'Kisan Bio',
        manufacturer: 'Kisan Chemicals',
        description: 'Testing duplicate SKU enforcement',
        packSize: 1,
        packUnit: 'L',
        sku: 'SKU-NEEM-TEST-001', // Duplicate SKU
        mrp: 1200,
        sellingPrice: 990,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DUPLICATE_SKU');
  });

  test('7. PENDING_APPROVAL product does NOT appear in public farmer marketplace catalog', async () => {
    const res = await request(app).get('/api/v1/marketplace/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const found = res.body.data.products.find((p: any) => p.id === pendingProductId);
    expect(found).toBeUndefined();
  });

  test('8. Photo Upload endpoint validates image format (accepts JPEG, rejects text/plain)', async () => {
    // Valid JPEG buffer upload
    const validRes = await request(app)
      .post('/api/v1/seller/marketplace/upload-image')
      .set('Authorization', `Bearer ${sellerApprovedToken}`)
      .attach('photo', Buffer.from('fake-jpeg-binary-header'), { filename: 'photo.jpg', contentType: 'image/jpeg' });

    expect(validRes.status).toBe(201);
    expect(validRes.body.success).toBe(true);
    expect(validRes.body.data.url).toContain('/uploads/products/');

    // Invalid TXT buffer upload
    const invalidRes = await request(app)
      .post('/api/v1/seller/marketplace/upload-image')
      .set('Authorization', `Bearer ${sellerApprovedToken}`)
      .attach('photo', Buffer.from('text content'), { filename: 'doc.txt', contentType: 'text/plain' });

    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.success).toBe(false);
    expect(invalidRes.body.error.code).toBe('INVALID_MIME_TYPE');
  });

  test('9. Admin Approval Flow: Admin approves pending product', async () => {
    const reviewRes = await request(app)
      .post(`/api/v1/admin/marketplace/products/${pendingProductId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' });

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.success).toBe(true);
    expect(reviewRes.body.data.status).toBe('APPROVED');

    approvedProductId = pendingProductId;
  });

  test('10. APPROVED product appears in public farmer catalog with search & category filtering', async () => {
    const catalogRes = await request(app).get(`/api/v1/marketplace/products?search=Bio%20Neem&categoryId=${categoryId}`);

    expect(catalogRes.status).toBe(200);
    expect(catalogRes.body.success).toBe(true);

    const found = catalogRes.body.data.products.find((p: any) => p.id === approvedProductId);
    expect(found).toBeDefined();
    expect(found.name).toBe('Hardened Test Product Bio Neem');
    expect(found.sellingPrice).toBe('990');
    expect(found.seller.businessName).toBe('Approved Krishi Seva');
  });

  test('11. Admin Rejection Flow: Admin rejects a product with reason', async () => {
    // Submit second product
    const createRes = await request(app)
      .post('/api/v1/seller/marketplace/products')
      .set('Authorization', `Bearer ${sellerApprovedToken}`)
      .send({
        name: 'Hardened Test Product To Be Rejected',
        categoryId,
        brand: 'Unknown',
        manufacturer: 'Unknown Ltd',
        description: 'Submitting product intended for admin rejection testing',
        packSize: 500,
        packUnit: 'g',
        mrp: 300,
        sellingPrice: 250,
      });

    rejectedProductId = createRes.body.data.id;

    // Admin rejects
    const reviewRes = await request(app)
      .post(`/api/v1/admin/marketplace/products/${rejectedProductId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'REJECTED', rejectionReason: 'Incomplete compliance documentation' });

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.data.status).toBe('REJECTED');
    expect(reviewRes.body.data.rejectionReason).toBe('Incomplete compliance documentation');

    // Verify REJECTED product does NOT appear in farmer marketplace
    const catalogRes = await request(app).get('/api/v1/marketplace/products');
    const found = catalogRes.body.data.products.find((p: any) => p.id === rejectedProductId);
    expect(found).toBeUndefined();
  });
});
