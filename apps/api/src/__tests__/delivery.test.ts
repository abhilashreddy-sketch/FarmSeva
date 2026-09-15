import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import { UserRole, UserStatus } from '@farm-seva/shared';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('FARM SEVA Delivery Partner Logistics API Test Suite', () => {
  let deliveryUserToken: string;
  let deliveryUserId: string;
  let deliveryPartnerId: string;
  let farmerToken: string;

  const deliveryPhone = '9555500001';
  const farmerPhone = '9555500002';

  beforeAll(async () => {
    // Cleanup existing test accounts
    const testPhones = [deliveryPhone, farmerPhone];
    await prisma.deliveryPartner.deleteMany({ where: { user: { phone: { in: testPhones } } } });
    await prisma.farmerProfile.deleteMany({ where: { user: { phone: { in: testPhones } } } });
    await prisma.user.deleteMany({ where: { phone: { in: testPhones } } });

    const passwordHash = await bcrypt.hash('TestPass123!', 12);

    // Create Delivery Partner User
    const delUser = await prisma.user.create({
      data: {
        phone: deliveryPhone,
        email: 'delivery.test@farmseva.com',
        fullName: 'Test Delivery Partner',
        passwordHash,
        role: UserRole.DELIVERY_PARTNER,
        status: UserStatus.ACTIVE,
        deliveryProfile: {
          create: {
            vehicleType: 'Motorcycle',
            vehicleNumber: 'AP 07 AB 9999',
            activeDistrict: 'Guntur',
            isAvailable: true,
          },
        },
      },
      include: { deliveryProfile: true },
    });
    deliveryUserId = delUser.id;
    deliveryPartnerId = delUser.deliveryProfile!.id;

    // Login as Delivery Partner to get Token
    const delLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ phone: deliveryPhone, password: 'TestPass123!' });
    deliveryUserToken = delLoginRes.body.data.accessToken;

    // Create Farmer User for RBAC test
    await prisma.user.create({
      data: {
        phone: farmerPhone,
        fullName: 'Test Farmer',
        passwordHash,
        role: UserRole.FARMER,
        status: UserStatus.ACTIVE,
      },
    });
    const farmerLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ phone: farmerPhone, password: 'TestPass123!' });
    farmerToken = farmerLoginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.deliveryPartner.deleteMany({ where: { user: { phone: { in: [deliveryPhone, farmerPhone] } } } });
    await prisma.farmerProfile.deleteMany({ where: { user: { phone: { in: [deliveryPhone, farmerPhone] } } } });
    await prisma.user.deleteMany({ where: { phone: { in: [deliveryPhone, farmerPhone] } } });
    await prisma.$disconnect();
  });

  test('1. GET /api/v1/delivery/profile returns delivery partner details', async () => {
    const res = await request(app)
      .get('/api/v1/delivery/profile')
      .set('Authorization', `Bearer ${deliveryUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicleNumber).toBe('AP 07 AB 9999');
    expect(res.body.data.user.fullName).toBe('Test Delivery Partner');
  });

  test('2. PATCH /api/v1/delivery/status toggles online status', async () => {
    const res = await request(app)
      .patch('/api/v1/delivery/status')
      .set('Authorization', `Bearer ${deliveryUserToken}`)
      .send({ isAvailable: true, latitude: 16.3067, longitude: 80.4365 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isAvailable).toBe(true);
  });

  test('3. POST /api/v1/delivery/location updates real-time GPS coordinates', async () => {
    const res = await request(app)
      .post('/api/v1/delivery/location')
      .set('Authorization', `Bearer ${deliveryUserToken}`)
      .send({ latitude: 16.312, longitude: 80.441, accuracy: 5.5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currentLat).toBe(16.312);
  });

  test('4. GET /api/v1/delivery/earnings returns earnings metrics & breakdown', async () => {
    const res = await request(app)
      .get('/api/v1/delivery/earnings')
      .set('Authorization', `Bearer ${deliveryUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('todayEarnings');
    expect(res.body.data).toHaveProperty('settledAmount');
  });

  test('5. GET /api/v1/delivery/history returns delivery history log', async () => {
    const res = await request(app)
      .get('/api/v1/delivery/history')
      .set('Authorization', `Bearer ${deliveryUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('6. POST /api/v1/delivery/support submits logistics issue ticket', async () => {
    const res = await request(app)
      .post('/api/v1/delivery/support')
      .set('Authorization', `Bearer ${deliveryUserToken}`)
      .send({ category: 'WRONG_ADDRESS', description: 'Customer landmark was incorrect.' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subject).toContain('WRONG_ADDRESS');
  });

  test('7. Farmer attempting delivery endpoint is rejected with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/delivery/profile')
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
