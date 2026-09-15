import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import { UserRole, UserStatus } from '@farm-seva/shared';
import bcrypt from 'bcryptjs';
import { seedCategories } from '../../../../packages/database/seed-categories';

const prisma = new PrismaClient();

export async function runPhase9Tests() {
  console.log('\n==================================================');
  console.log('🧪 FARM SEVA — PHASE 9 MARKETPLACE, ORDERS & PAYMENTS TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  async function testCase(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ PASSED: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ FAILED: ${name}`);
      console.error('   Error:', err.message || err);
      failed++;
    }
  }

  let farmerToken = '';
  let farmerUserId = '';
  let farmerProfileId = '';
  let farmerAddressId = '';

  let farmerBToken = '';
  let farmerBUserId = '';
  let farmerBAddressId = '';

  let sellerAToken = '';
  let sellerAUserId = '';
  let sellerAId = '';
  let shopAId = '';

  let sellerBToken = '';
  let sellerBUserId = '';
  let sellerBId = '';

  let adminToken = '';
  let adminUserId = '';

  let deliveryPartnerToken = '';
  let deliveryPartnerId = '';

  let categoryId = '';
  let productId = '';
  let productSlug = '';
  let variantId = '';
  let listingId = '';

  let createdOrderId = '';
  let createdDeliveryId = '';

  // SETUP
  await seedCategories();
  const categories = await prisma.category.findMany();
  if (categories.length === 0) throw new Error('No categories found');
  categoryId = categories[0].id;

  const testPhones = ['9800000001', '9800000002', '9800000003', '9800000004', '9800000005', '9800000006'];
  
  await prisma.auditLog.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.sellerListing.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productCompliance.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.product.deleteMany({ where: { name: { contains: 'P9 Test Product' } } });
  await prisma.shop.deleteMany({ where: { shopName: { contains: 'P9 Shop' } } });
  await prisma.seller.deleteMany({ where: { pesticideLicenseNo: { contains: 'P9/LIC/' } } });
  await prisma.deliveryPartner.deleteMany({ where: { vehicleNumber: 'AP 07 P9 9999' } });
  await prisma.farmerProfile.deleteMany({ where: { user: { phone: { in: testPhones } } } });
  await prisma.user.deleteMany({ where: { phone: { in: testPhones } } });

  const passHash = await bcrypt.hash('TestPassword123!', 10);

  // 1. Create Farmer A
  const farmerUser = await prisma.user.create({
    data: {
      phone: '9800000001',
      fullName: 'Phase 9 Farmer A',
      email: 'farmer.a.p9@farmseva.com',
      passwordHash: passHash,
      role: UserRole.FARMER,
      status: UserStatus.ACTIVE,
      farmerProfile: {
        create: { district: 'Guntur', state: 'Andhra Pradesh' },
      },
      addresses: {
        create: {
          recipientName: 'Phase 9 Farmer A',
          phone: '9800000001',
          houseNo: '1-123',
          streetLandmark: 'Main Canal Road',
          villageTaluk: 'Kaza',
          district: 'Guntur',
          state: 'Andhra Pradesh',
          pincode: '522508',
          isDefault: true,
        },
      },
    },
    include: { farmerProfile: true, addresses: true },
  });
  farmerUserId = farmerUser.id;
  farmerProfileId = farmerUser.farmerProfile!.id;
  farmerAddressId = farmerUser.addresses[0].id;

  const farmerLogin = await request(app).post('/api/v1/auth/login').send({ phone: '9800000001', password: 'TestPassword123!' });
  farmerToken = farmerLogin.body.data.accessToken;

  // 2. Create Farmer B
  const farmerBUser = await prisma.user.create({
    data: {
      phone: '9800000002',
      fullName: 'Phase 9 Farmer B',
      email: 'farmer.b.p9@farmseva.com',
      passwordHash: passHash,
      role: UserRole.FARMER,
      status: UserStatus.ACTIVE,
      farmerProfile: { create: { district: 'Kolar', state: 'Karnataka' } },
      addresses: {
        create: {
          recipientName: 'Phase 9 Farmer B',
          phone: '9800000002',
          houseNo: '2-456',
          streetLandmark: 'Station Road',
          villageTaluk: 'Kolar',
          district: 'Kolar',
          state: 'Karnataka',
          pincode: '563101',
          isDefault: true,
        },
      },
    },
    include: { farmerProfile: true, addresses: true },
  });
  farmerBUserId = farmerBUser.id;
  farmerBAddressId = farmerBUser.addresses[0].id;

  const farmerBLogin = await request(app).post('/api/v1/auth/login').send({ phone: '9800000002', password: 'TestPassword123!' });
  farmerBToken = farmerBLogin.body.data.accessToken;

  // 3. Create Seller A
  const sellerAUser = await prisma.user.create({
    data: {
      phone: '9800000003',
      fullName: 'Phase 9 Seller A',
      email: 'seller.a.p9@farmseva.com',
      passwordHash: passHash,
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
    },
  });
  sellerAUserId = sellerAUser.id;

  const sellerAObj = await prisma.seller.create({
    data: {
      userId: sellerAUserId,
      businessName: 'P9 Seller A Kendra',
      pesticideLicenseNo: 'P9/LIC/001',
      verificationStatus: 'APPROVED',
      shops: {
        create: {
          shopName: 'P9 Shop A',
          addressLine: 'APMC Market Yard',
          taluk: 'Guntur',
          district: 'Guntur',
          state: 'Andhra Pradesh',
          pincode: '522001',
          contactPhone: '9800000003',
        },
      },
    },
    include: { shops: true },
  });
  sellerAId = sellerAObj.id;
  shopAId = sellerAObj.shops[0].id;

  const sellerALogin = await request(app).post('/api/v1/auth/login').send({ phone: '9800000003', password: 'TestPassword123!' });
  sellerAToken = sellerALogin.body.data.accessToken;

  // 4. Create Seller B
  const sellerBUser = await prisma.user.create({
    data: {
      phone: '9800000004',
      fullName: 'Phase 9 Seller B',
      email: 'seller.b.p9@farmseva.com',
      passwordHash: passHash,
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
    },
  });
  sellerBUserId = sellerBUser.id;

  const sellerBObj = await prisma.seller.create({
    data: {
      userId: sellerBUserId,
      businessName: 'P9 Seller B Kendra',
      pesticideLicenseNo: 'P9/LIC/002',
      verificationStatus: 'APPROVED',
      shops: {
        create: {
          shopName: 'P9 Shop B',
          addressLine: 'Station Road',
          taluk: 'Tenali',
          district: 'Guntur',
          state: 'Andhra Pradesh',
          pincode: '522201',
          contactPhone: '9800000004',
        },
      },
    },
    include: { shops: true },
  });
  sellerBId = sellerBObj.id;

  const sellerBLogin = await request(app).post('/api/v1/auth/login').send({ phone: '9800000004', password: 'TestPassword123!' });
  sellerBToken = sellerBLogin.body.data.accessToken;

  // 5. Create Admin
  const adminUser = await prisma.user.create({
    data: {
      phone: '9800000005',
      fullName: 'Phase 9 Admin',
      email: 'admin.p9@farmseva.com',
      passwordHash: passHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  adminUserId = adminUser.id;

  const adminLogin = await request(app).post('/api/v1/auth/login').send({ phone: '9800000005', password: 'TestPassword123!' });
  adminToken = adminLogin.body.data.accessToken;

  // 6. Create Delivery Partner
  const dpUser = await prisma.user.create({
    data: {
      phone: '9800000006',
      fullName: 'Phase 9 Delivery Agent',
      email: 'delivery.p9@farmseva.com',
      passwordHash: passHash,
      role: UserRole.DELIVERY_PARTNER,
      status: UserStatus.ACTIVE,
      deliveryProfile: {
        create: {
          vehicleType: 'Motorcycle',
          vehicleNumber: 'AP 07 P9 9999',
          activeDistrict: 'Guntur',
        },
      },
    },
    include: { deliveryProfile: true },
  });
  deliveryPartnerId = dpUser.deliveryProfile!.id;

  // 7. Create APPROVED Product for Seller A
  productSlug = 'p9-test-product-bio-pesticide-' + Date.now();
  const product = await prisma.product.create({
    data: {
      sellerId: sellerAId,
      categoryId,
      name: 'P9 Test Product Bio Pesticide',
      slug: productSlug,
      brand: 'Kisan Bio',
      manufacturer: 'Kisan Organics Ltd',
      description: 'Eco friendly pesticide for chilli thrips and whitefly control',
      packSize: 500,
      packUnit: 'ml',
      mrp: 850,
      sellingPrice: 750,
      status: 'APPROVED',
      isDemo: false,
      variants: {
        create: {
          packSize: 500,
          packUnit: 'ml',
          mrp: 850,
          sellingPrice: 750,
          stockQuantity: 20,
          sku: 'SKU-P9-BIO-500ML',
        },
      },
      images: {
        create: {
          imageUrl: '/uploads/products/p9_bio.jpg',
          isPrimary: true,
        },
      },
    },
    include: { variants: true },
  });
  productId = product.id;
  variantId = product.variants[0].id;

  const listing = await prisma.sellerListing.create({
    data: {
      sellerId: sellerAId,
      shopId: shopAId,
      productId,
      variantId,
      sellingPrice: 750,
      quantityAvailable: 20,
    },
  });
  listingId = listing.id;

  // TEST CASES
  await testCase('1. Product listing returns approved products from database', async () => {
    const res = await request(app).get('/api/v1/marketplace/products');
    if (res.status !== 200 || !res.body.success || res.body.data.products.length === 0) {
      throw new Error(`Product listing failed: ${JSON.stringify(res.body)}`);
    }
  });

  await testCase('2. Product detail returns complete product details', async () => {
    const res = await request(app).get(`/api/v1/marketplace/products/${productSlug}`);
    if (res.status !== 200 || res.body.data.id !== productId) {
      throw new Error(`Product detail failed: ${JSON.stringify(res.body)}`);
    }
  });

  await testCase('3. Farmer adds product to cart', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        productId,
        variantId,
        sellerListingId: listingId,
        quantity: 2,
      });

    if (res.status !== 201 || !res.body.success) {
      throw new Error(`Add to cart failed: ${JSON.stringify(res.body)}`);
    }
  });

  await testCase('4. Farmer updates cart item quantity', async () => {
    const cartRes = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${farmerToken}`);
    const cartItemId = cartRes.body.data.items[0].id;

    const res = await request(app)
      .patch(`/api/v1/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ quantity: 3 });

    if (res.status !== 200 || res.body.data.quantity !== 3) {
      throw new Error(`Update cart failed: ${JSON.stringify(res.body)}`);
    }
  });

  await testCase('5. Farmer removes item from cart and re-adds for checkout', async () => {
    const cartRes = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${farmerToken}`);
    const cartItemId = cartRes.body.data.items[0].id;

    const delRes = await request(app)
      .delete(`/api/v1/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${farmerToken}`);
    if (delRes.status !== 200) throw new Error('Remove cart item failed');

    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        productId,
        variantId,
        sellerListingId: listingId,
        quantity: 2,
      });
  });

  await testCase('6. Empty cart checkout rejection', async () => {
    const res = await request(app)
      .post('/api/v1/orders/checkout')
      .set('Authorization', `Bearer ${farmerBToken}`)
      .send({
        addressId: farmerBAddressId,
        paymentMethod: 'COD',
      });

    if (res.status !== 400 || res.body.error.code !== 'CART_EMPTY') {
      throw new Error(`Expected 400 CART_EMPTY, got ${res.status}`);
    }
  });

  await testCase('7. Invalid quantity rejection', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${farmerBToken}`)
      .send({
        productId,
        variantId,
        quantity: 0,
      });

    if (res.status !== 400) throw new Error('Expected 400 for 0 quantity');
  });

  await testCase('8. Insufficient inventory rejection on checkout', async () => {
    // Add 500 items to Farmer B cart (Stock is 20)
    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${farmerBToken}`)
      .send({
        productId,
        variantId,
        sellerListingId: listingId,
        quantity: 500,
      });

    const res = await request(app)
      .post('/api/v1/orders/checkout')
      .set('Authorization', `Bearer ${farmerBToken}`)
      .send({
        addressId: farmerBAddressId,
        paymentMethod: 'COD',
      });

    if (res.status !== 400 || res.body.error.code !== 'INVENTORY_UNAVAILABLE') {
      throw new Error(`Expected 400 INVENTORY_UNAVAILABLE, got ${res.status}`);
    }

    // Clear Farmer B cart after test
    await request(app)
      .delete('/api/v1/cart')
      .set('Authorization', `Bearer ${farmerBToken}`);
  });

  await testCase('9 & 10. Server-side price validation & checkout total calculation', async () => {
    const res = await request(app)
      .post('/api/v1/orders/checkout')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        addressId: farmerAddressId,
        paymentMethod: 'ONLINE',
      });

    if (res.status !== 201 || !res.body.success) {
      throw new Error(`Checkout failed: ${JSON.stringify(res.body)}`);
    }

    const order = res.body.data.orders[0];
    if (Number(order.netAmount) !== 1500) {
      throw new Error(`Expected netAmount 1500, got ${order.netAmount}`);
    }
    createdOrderId = order.id;

    const delivery = await prisma.delivery.findUnique({ where: { orderId: createdOrderId } });
    if (!delivery) throw new Error('Delivery record not created');
    createdDeliveryId = delivery.id;
  });

  await testCase('11 & 12. Razorpay order creation behavior & missing credentials failure', async () => {
    const res = await request(app)
      .post('/api/v1/payments/create-order')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ orderId: createdOrderId });

    if (res.status !== 400 || res.body.error.code !== 'PAYMENT_PROVIDER_ERROR') {
      throw new Error(`Expected 400 PAYMENT_PROVIDER_ERROR, got ${res.status}`);
    }
  });

  await testCase('13 & 14. Invalid payment signature rejected', async () => {
    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        orderId: createdOrderId,
        razorpayOrderId: 'order_test_123',
        razorpayPaymentId: 'pay_test_456',
        razorpaySignature: 'invalid_signature_hex_string',
      });

    if (res.status !== 400) {
      throw new Error(`Expected 400 for invalid payment signature, got ${res.status}`);
    }
  });

  await testCase('15. Payment/order mismatch', async () => {
    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        orderId: '00000000-0000-0000-0000-000000000000',
        razorpayOrderId: 'order_test_123',
        razorpayPaymentId: 'pay_test_456',
        razorpaySignature: 'invalid_sig',
      });

    if (res.status !== 400) throw new Error(`Expected 400 for order mismatch, got ${res.status}`);
  });

  await testCase('16 & 17. Webhook without secret returns 400 WEBHOOK_SECRET_MISSING', async () => {
    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-razorpay-signature', 'invalid_webhook_signature')
      .send({ event: 'payment.captured' });

    if (res.status !== 400 || res.body.error.code !== 'WEBHOOK_SECRET_MISSING') {
      throw new Error(`Expected 400 WEBHOOK_SECRET_MISSING, got ${res.status}`);
    }
  });

  await testCase('21. Order item pricing retains snapshot price even if product price changes later', async () => {
    const orderItem = await prisma.orderItem.findFirst({ where: { orderId: createdOrderId } });
    if (!orderItem || Number(orderItem.unitPrice) !== 750) throw new Error('Order item price mismatch');

    await prisma.product.update({ where: { id: productId }, data: { sellingPrice: 900 } });

    const orderItemAfter = await prisma.orderItem.findFirst({ where: { orderId: createdOrderId } });
    if (!orderItemAfter || Number(orderItemAfter.unitPrice) !== 750) {
      throw new Error('Order snapshot price was modified by product price change!');
    }
  });

  await testCase('22. Seller can see own orders', async () => {
    const res = await request(app)
      .get('/api/v1/orders/seller/orders')
      .set('Authorization', `Bearer ${sellerAToken}`);

    if (res.status !== 200 || !res.body.success || res.body.data.length === 0) {
      throw new Error(`Get seller orders failed: ${JSON.stringify(res.body)}`);
    }
  });

  await testCase('23. Seller B modifying Seller A order is rejected with 403', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/seller/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${sellerBToken}`)
      .send({ status: 'ACCEPTED' });

    if (res.status !== 403 || res.body.error.code !== 'AUTH_OWNERSHIP_DENIED') {
      throw new Error(`Expected 403 AUTH_OWNERSHIP_DENIED, got ${res.status}`);
    }
  });

  await testCase('24. Seller A accepts order (PENDING_ACCEPTANCE -> ACCEPTED)', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/seller/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${sellerAToken}`)
      .send({ status: 'ACCEPTED' });

    if (res.status !== 200 || res.body.data.status !== 'ACCEPTED') {
      throw new Error(`Accept order failed: ${JSON.stringify(res.body)}`);
    }
  });

  await testCase('25. Seller A attempting invalid transition (ACCEPTED -> DELIVERED) returns 400', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/seller/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${sellerAToken}`)
      .send({ status: 'DELIVERED' });

    if (res.status !== 400 || res.body.error.code !== 'INVALID_ORDER_STATE') {
      throw new Error(`Expected 400 INVALID_ORDER_STATE, got ${res.status}`);
    }
  });

  await testCase('26. Seller A transitions order to PACKING', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/seller/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${sellerAToken}`)
      .send({ status: 'PACKING' });

    if (res.status !== 200 || res.body.data.status !== 'PACKING') {
      throw new Error(`Packing order failed: ${JSON.stringify(res.body)}`);
    }
  });

  await testCase('27. Admin lists all orders across system', async () => {
    const res = await request(app)
      .get('/api/v1/orders/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    if (res.status !== 200 || !res.body.success || res.body.data.length === 0) {
      throw new Error(`Admin orders failed: ${JSON.stringify(res.body)}`);
    }
  });

  await testCase('28. Admin assigns delivery partner to order delivery', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/deliveries/${createdDeliveryId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ deliveryPartnerId });

    if (res.status !== 200 || res.body.data.status !== 'ASSIGNED') {
      throw new Error(`Delivery assignment failed: ${JSON.stringify(res.body)}`);
    }
  });

  await testCase('29. Farmer A views order detail and status', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/farmer/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${farmerToken}`);

    if (res.status !== 200 || res.body.data.id !== createdOrderId) {
      throw new Error(`Farmer order detail failed: ${JSON.stringify(res.body)}`);
    }
  });

  await testCase('30. Farmer B accessing Farmer A order is rejected with 403', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/farmer/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${farmerBToken}`);

    if (res.status !== 403 || res.body.error.code !== 'AUTH_OWNERSHIP_DENIED') {
      throw new Error(`Expected 403 AUTH_OWNERSHIP_DENIED, got ${res.status}`);
    }
  });

  console.log('\n==================================================');
  console.log(`📊 PHASE 9 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runPhase9Tests()
    .catch((e) => {
      console.error('Fatal test error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
