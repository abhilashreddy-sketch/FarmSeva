import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import { UserRole, UserStatus } from '@farm-seva/shared';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('FARM SEVA Phase 3 - Farmer Profile, Farm, Field & Crop Test Suite', () => {
  let farmerAToken: string;
  let farmerAUserId: string;

  let farmerBToken: string;
  let farmerBUserId: string;

  let sellerToken: string;

  let farmAId: string;
  let fieldAId: string;
  let cropAId: string;

  let farmBId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.crop.deleteMany({});
    await prisma.farmField.deleteMany({});
    await prisma.farm.deleteMany({});
    await prisma.farmerProfile.deleteMany({});
    await prisma.user.deleteMany({
      where: { phone: { in: ['9777700001', '9777700002', '9777700003'] } },
    });

    const passHash = await bcrypt.hash('TestPass123!', 12);

    // Create Farmer A
    const userA = await prisma.user.create({
      data: {
        phone: '9777700001',
        fullName: 'Farmer A',
        passwordHash: passHash,
        role: UserRole.FARMER,
        status: UserStatus.ACTIVE,
        preferredLanguage: 'te',
        farmerProfile: { create: { experienceYears: 5 } },
      },
    });
    farmerAUserId = userA.id;

    // Create Farmer B
    const userB = await prisma.user.create({
      data: {
        phone: '9777700002',
        fullName: 'Farmer B',
        passwordHash: passHash,
        role: UserRole.FARMER,
        status: UserStatus.ACTIVE,
        preferredLanguage: 'kn',
        farmerProfile: { create: { experienceYears: 12 } },
      },
    });
    farmerBUserId = userB.id;

    // Create Seller
    await prisma.user.create({
      data: {
        phone: '9777700003',
        fullName: 'Seller C',
        passwordHash: passHash,
        role: UserRole.SELLER,
        status: UserStatus.ACTIVE,
      },
    });

    // Login tokens
    const loginA = await request(app).post('/api/v1/auth/login').send({ phone: '9777700001', password: 'TestPass123!' });
    farmerAToken = loginA.body.data.accessToken;

    const loginB = await request(app).post('/api/v1/auth/login').send({ phone: '9777700002', password: 'TestPass123!' });
    farmerBToken = loginB.body.data.accessToken;

    const loginC = await request(app).post('/api/v1/auth/login').send({ phone: '9777700003', password: 'TestPass123!' });
    sellerToken = loginC.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. GET FARMER PROFILE
  test('1. Get authenticated Farmer A profile', async () => {
    const res = await request(app)
      .get('/api/v1/farmer/profile')
      .set('Authorization', `Bearer ${farmerAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBe(farmerAUserId);
  });

  // 2. UPDATE FARMER PROFILE
  test('2. Update Farmer A profile details', async () => {
    const res = await request(app)
      .patch('/api/v1/farmer/profile')
      .set('Authorization', `Bearer ${farmerAToken}`)
      .send({
        village: 'Kaza Village',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        pincode: '522508',
        totalLandAcres: 8.5,
        primaryWaterSource: 'Canal & Borewell',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.village).toBe('Kaza Village');
    expect(Number(res.body.data.totalLandAcres)).toBe(8.5);
  });

  // 3. CREATE FARM (FARMER A)
  test('3. Create Farm for Farmer A', async () => {
    const res = await request(app)
      .post('/api/v1/farmer/farms')
      .set('Authorization', `Bearer ${farmerAToken}`)
      .send({
        name: 'Main Canal Farm',
        locationVillage: 'Kaza',
        locationDistrict: 'Guntur',
        locationState: 'Andhra Pradesh',
        totalAreaAcres: 5.0,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Main Canal Farm');
    farmAId = res.body.data.id;
  });

  // 4. GET FARMS (FARMER A)
  test('4. Get list of farms for Farmer A', async () => {
    const res = await request(app)
      .get('/api/v1/farmer/farms')
      .set('Authorization', `Bearer ${farmerAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(farmAId);
  });

  // 5. CREATE FARM (FARMER B)
  test('5. Create Farm for Farmer B', async () => {
    const res = await request(app)
      .post('/api/v1/farmer/farms')
      .set('Authorization', `Bearer ${farmerBToken}`)
      .send({
        name: 'Hilltop Farm B',
        locationDistrict: 'Kolar',
        locationState: 'Karnataka',
        totalAreaAcres: 10.0,
      });

    expect(res.status).toBe(201);
    farmBId = res.body.data.id;
  });

  // 6. OWNERSHIP TEST: FARMER A ATTEMPTING TO ACCESS FARM B
  test('6. OWNERSHIP SECURITY: Farmer A accessing Farm B is rejected with 403', async () => {
    const res = await request(app)
      .get(`/api/v1/farmer/farms/${farmBId}`)
      .set('Authorization', `Bearer ${farmerAToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('AUTH_OWNERSHIP_DENIED');
  });

  // 7. CREATE FIELD (FARMER A UNDER FARM A)
  test('7. Create Field under Farm A', async () => {
    const res = await request(app)
      .post(`/api/v1/farmer/farms/${farmAId}/fields`)
      .set('Authorization', `Bearer ${farmerAToken}`)
      .send({
        name: 'North Plot',
        areaAcres: 2.5,
        soilType: 'Black Cotton Soil',
        irrigationType: 'Drip Irrigation',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('North Plot');
    fieldAId = res.body.data.id;
  });

  // 8. OWNERSHIP TEST: FARMER B ATTEMPTING TO ADD FIELD TO FARM A
  test('8. OWNERSHIP SECURITY: Farmer B creating field under Farm A is rejected with 403', async () => {
    const res = await request(app)
      .post(`/api/v1/farmer/farms/${farmAId}/fields`)
      .set('Authorization', `Bearer ${farmerBToken}`)
      .send({
        name: 'Unauthorized Field',
        areaAcres: 1.0,
      });

    expect(res.status).toBe(403);
  });

  // 9. CREATE CROP (FARMER A UNDER FIELD A)
  test('9. Create Crop under Field A', async () => {
    const sowingDate = new Date();
    const harvestDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const res = await request(app)
      .post('/api/v1/farmer/crops')
      .set('Authorization', `Bearer ${farmerAToken}`)
      .send({
        fieldId: fieldAId,
        cropName: 'Chilli',
        variety: 'Teja 44',
        sowingDate: sowingDate.toISOString(),
        expectedHarvestDate: harvestDate.toISOString(),
        areaPlantedAcres: 2.0,
        status: 'GROWING',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.cropName).toBe('Chilli');
    cropAId = res.body.data.id;
  });

  // 10. INVALID HARVEST DATE REJECTED
  test('10. Invalid date (harvest date before sowing date) is rejected with 400', async () => {
    const sowingDate = new Date();
    const pastHarvestDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    const res = await request(app)
      .post('/api/v1/farmer/crops')
      .set('Authorization', `Bearer ${farmerAToken}`)
      .send({
        fieldId: fieldAId,
        cropName: 'Tomato',
        sowingDate: sowingDate.toISOString(),
        expectedHarvestDate: pastHarvestDate.toISOString(),
        areaPlantedAcres: 1.0,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // 11. OWNERSHIP TEST: FARMER B ATTEMPTING TO UPDATE CROP A
  test('11. OWNERSHIP SECURITY: Farmer B updating Crop A is rejected with 403', async () => {
    const res = await request(app)
      .patch(`/api/v1/farmer/crops/${cropAId}`)
      .set('Authorization', `Bearer ${farmerBToken}`)
      .send({
        cropName: 'Hacked Crop Name',
      });

    expect(res.status).toBe(403);
  });

  // 12. UPDATE CROP (FARMER A)
  test('12. Farmer A updates Crop A stage and status', async () => {
    const res = await request(app)
      .patch(`/api/v1/farmer/crops/${cropAId}`)
      .set('Authorization', `Bearer ${farmerAToken}`)
      .send({
        stage: 'Flowering',
        status: 'GROWING',
        notes: 'Flowering stage healthy. Drip irrigation applied.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.stage).toBe('Flowering');
  });

  // 13. SELLER BLOCKED FROM FARMER DOMAIN
  test('13. Seller role attempting Farmer endpoints is rejected with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/farmer/farms')
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('AUTH_FORBIDDEN');
  });

  // 14. GET CROP MASTER DATA
  test('14. Public/Auth Crop Master Data endpoint returns supported crop list', async () => {
    const res = await request(app).get('/api/v1/farmer/crop-master-data');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(5);
  });

  // 15. DELETE CROP (FARMER A)
  test('15. Farmer A deletes Crop A', async () => {
    const res = await request(app)
      .delete(`/api/v1/farmer/crops/${cropAId}`)
      .set('Authorization', `Bearer ${farmerAToken}`);

    expect(res.status).toBe(200);
  });
});
