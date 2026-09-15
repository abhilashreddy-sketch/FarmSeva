import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import { UserRole, UserStatus } from '@farm-seva/shared';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function runAllPhaseTests() {
  console.log('\n==================================================');
  console.log('🧪 FARM SEVA - INTEGRATED PHASE 2 & PHASE 3 TEST SUITE');
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

  let adminAccessToken = '';
  let farmerAccessToken = '';
  let farmerUserId = '';
  let sellerUserId = '';

  let farmAId = '';
  let fieldAId = '';
  let cropAId = '';
  let farmerBToken = '';
  let farmBId = '';

  const farmerPhone = '9888800001';
  const farmerBPhone = '9888800099';
  const sellerPhone = '9888800002';
  const expertPhone = '9888800004';
  const deliveryPhone = '9888800005';
  const suspendedPhone = '9888800003';

  // CLEANUP
  await prisma.auditLog.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.crop.deleteMany({});
  await prisma.farmField.deleteMany({});
  await prisma.farm.deleteMany({});
  await prisma.farmerProfile.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      phone: { in: ['9999911111', farmerPhone, farmerBPhone, sellerPhone, expertPhone, deliveryPhone, suspendedPhone, '9666611111'] },
    },
  });

  // SEED ADMIN
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 12);
  await prisma.user.create({
    data: {
      phone: '9999911111',
      email: 'admin.test@farmseva.demo',
      passwordHash: adminPasswordHash,
      fullName: 'Test Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const adminLoginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ phone: '9999911111', password: 'AdminPassword123!' });
  adminAccessToken = adminLoginRes.body.data.accessToken;

  // --- PHASE 2 AUTH TESTS ---
  await testCase('1. Farmer Registration (Status default ACTIVE)', async () => {
    const res = await request(app).post('/api/v1/auth/register/farmer').send({
      phone: farmerPhone,
      fullName: 'Raju Farmer',
      password: 'FarmerPassword123!',
      preferredLanguage: 'te',
    });
    if (res.status !== 201 || res.body.data.role !== 'FARMER' || res.body.data.status !== 'ACTIVE') {
      throw new Error(`Unexpected response: ${JSON.stringify(res.body)}`);
    }
    farmerUserId = res.body.data.id;
  });

  await testCase('2. Farmer B Registration', async () => {
    const res = await request(app).post('/api/v1/auth/register/farmer').send({
      phone: farmerBPhone,
      fullName: 'Suresh Farmer B',
      password: 'FarmerPassword123!',
      preferredLanguage: 'kn',
    });
    if (res.status !== 201) throw new Error('Farmer B registration failed');

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      phone: farmerBPhone,
      password: 'FarmerPassword123!',
    });
    farmerBToken = loginRes.body.data.accessToken;
  });

  await testCase('3. Seller Registration (Status default PENDING_VERIFICATION)', async () => {
    const res = await request(app).post('/api/v1/auth/register/seller').send({
      phone: sellerPhone,
      fullName: 'Suresh Dealer',
      password: 'SellerPassword123!',
      businessName: 'Suresh Krishi Kendra',
      pesticideLicenseNo: 'AP/GNT/PEST/9988',
      shopName: 'Suresh Shop Main',
      addressLine: 'APMC Market Road',
      taluk: 'Guntur',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      pincode: '522001',
      contactPhone: sellerPhone,
    });
    if (res.status !== 201 || res.body.data.user.status !== 'PENDING_VERIFICATION') {
      throw new Error(`Unexpected response: ${JSON.stringify(res.body)}`);
    }
    sellerUserId = res.body.data.user.id;
  });

  await testCase('4. Login Success & Token Generation', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      phone: farmerPhone,
      password: 'FarmerPassword123!',
    });
    if (res.status !== 200 || !res.body.data.accessToken) {
      throw new Error(`Login failed: ${JSON.stringify(res.body)}`);
    }
    farmerAccessToken = res.body.data.accessToken;
  });

  await testCase('5. Refresh Token Rotation', async () => {
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      phone: farmerPhone,
      password: 'FarmerPassword123!',
    });
    const oldRefreshToken = loginRes.body.data.refreshToken;

    const refreshRes = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: oldRefreshToken,
    });
    if (refreshRes.status !== 200 || !refreshRes.body.data.accessToken) {
      throw new Error(`Refresh failed: ${JSON.stringify(refreshRes.body)}`);
    }

    const reuseRes = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: oldRefreshToken,
    });
    if (reuseRes.status !== 401) throw new Error('Reused refresh token was not blocked');
  });

  // --- PHASE 3 FARM, FIELD & CROP TESTS ---
  await testCase('6. Get Farmer Profile', async () => {
    const res = await request(app)
      .get('/api/v1/farmer/profile')
      .set('Authorization', `Bearer ${farmerAccessToken}`);
    if (res.status !== 200 || !res.body.data.id) throw new Error('Get profile failed');
  });

  await testCase('7. Update Farmer Profile Details', async () => {
    const res = await request(app)
      .patch('/api/v1/farmer/profile')
      .set('Authorization', `Bearer ${farmerAccessToken}`)
      .send({
        village: 'Kaza Village',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        pincode: '522508',
        totalLandAcres: 8.5,
      });
    if (res.status !== 200 || res.body.data.village !== 'Kaza Village') {
      throw new Error('Update profile failed');
    }
  });

  await testCase('8. Create Farm A for Farmer A', async () => {
    const res = await request(app)
      .post('/api/v1/farmer/farms')
      .set('Authorization', `Bearer ${farmerAccessToken}`)
      .send({
        name: 'Main Canal Farm',
        locationVillage: 'Kaza',
        locationDistrict: 'Guntur',
        locationState: 'Andhra Pradesh',
        totalAreaAcres: 5.0,
      });
    if (res.status !== 201 || !res.body.data.id) throw new Error('Create farm failed');
    farmAId = res.body.data.id;
  });

  await testCase('9. Create Farm B for Farmer B', async () => {
    const res = await request(app)
      .post('/api/v1/farmer/farms')
      .set('Authorization', `Bearer ${farmerBToken}`)
      .send({
        name: 'Hilltop Farm B',
        locationDistrict: 'Kolar',
        locationState: 'Karnataka',
        totalAreaAcres: 10.0,
      });
    if (res.status !== 201) throw new Error('Create Farm B failed');
    farmBId = res.body.data.id;
  });

  await testCase('10. OWNERSHIP SECURITY: Farmer A Accessing Farm B Rejected (403)', async () => {
    const res = await request(app)
      .get(`/api/v1/farmer/farms/${farmBId}`)
      .set('Authorization', `Bearer ${farmerAccessToken}`);
    if (res.status !== 403 || res.body.error.code !== 'AUTH_OWNERSHIP_DENIED') {
      throw new Error(`Expected 403 AUTH_OWNERSHIP_DENIED, got ${res.status}`);
    }
  });

  await testCase('11. Create Field under Farm A', async () => {
    const res = await request(app)
      .post(`/api/v1/farmer/farms/${farmAId}/fields`)
      .set('Authorization', `Bearer ${farmerAccessToken}`)
      .send({
        name: 'North Plot',
        areaAcres: 2.5,
        soilType: 'Black Cotton Soil',
        irrigationType: 'Drip Irrigation',
      });
    if (res.status !== 201 || !res.body.data.id) throw new Error('Create field failed');
    fieldAId = res.body.data.id;
  });

  await testCase('12. Create Crop under Field A', async () => {
    const sowingDate = new Date();
    const harvestDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const res = await request(app)
      .post('/api/v1/farmer/crops')
      .set('Authorization', `Bearer ${farmerAccessToken}`)
      .send({
        fieldId: fieldAId,
        cropName: 'Chilli',
        variety: 'Teja 44',
        sowingDate: sowingDate.toISOString(),
        expectedHarvestDate: harvestDate.toISOString(),
        areaPlantedAcres: 2.0,
        status: 'GROWING',
      });
    if (res.status !== 201 || !res.body.data.id) throw new Error('Create crop failed');
    cropAId = res.body.data.id;
  });

  await testCase('13. Invalid Date Validation (Harvest earlier than Sowing) Rejected (400)', async () => {
    const sowingDate = new Date();
    const pastHarvestDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    const res = await request(app)
      .post('/api/v1/farmer/crops')
      .set('Authorization', `Bearer ${farmerAccessToken}`)
      .send({
        fieldId: fieldAId,
        cropName: 'Tomato',
        sowingDate: sowingDate.toISOString(),
        expectedHarvestDate: pastHarvestDate.toISOString(),
        areaPlantedAcres: 1.0,
      });
    if (res.status !== 400 || res.body.error.code !== 'VALIDATION_ERROR') {
      throw new Error(`Expected 400 VALIDATION_ERROR, got ${res.status}`);
    }
  });

  await testCase('14. OWNERSHIP SECURITY: Farmer B Modifying Crop A Rejected (403)', async () => {
    const res = await request(app)
      .patch(`/api/v1/farmer/crops/${cropAId}`)
      .set('Authorization', `Bearer ${farmerBToken}`)
      .send({ cropName: 'Hacked Crop' });
    if (res.status !== 403 || res.body.error.code !== 'AUTH_OWNERSHIP_DENIED') {
      throw new Error(`Expected 403 AUTH_OWNERSHIP_DENIED, got ${res.status}`);
    }
  });

  await testCase('15. Update Crop Stage and Status', async () => {
    const res = await request(app)
      .patch(`/api/v1/farmer/crops/${cropAId}`)
      .set('Authorization', `Bearer ${farmerAccessToken}`)
      .send({ stage: 'Flowering', status: 'GROWING' });
    if (res.status !== 200 || res.body.data.stage !== 'Flowering') {
      throw new Error('Update crop failed');
    }
  });

  await testCase('16. Get Crop Master Data', async () => {
    const res = await request(app).get('/api/v1/farmer/crop-master-data');
    if (res.status !== 200 || !Array.isArray(res.body.data)) {
      throw new Error('Get master data failed');
    }
  });

  await testCase('17. Audit Log Writing Verification', async () => {
    const logs = await prisma.auditLog.findMany({
      where: { action: { in: ['CREATE_FARM', 'CREATE_FIELD', 'CREATE_CROP'] } },
    });
    if (logs.length < 3) throw new Error('Audit logs missing for farm actions');
  });

  console.log('\n==================================================');
  console.log(`📊 INTEGRATED TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) process.exit(1);
}

runAllPhaseTests()
  .catch((e) => {
    console.error('Fatal test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
