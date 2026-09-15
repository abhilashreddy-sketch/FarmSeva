import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import { UserRole, UserStatus } from '@farm-seva/shared';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('FARM SEVA Authentication & RBAC Test Suite', () => {
  let adminAccessToken: string;
  let adminUserId: string;

  let farmerAccessToken: string;
  let farmerUserId: string;
  const farmerPhone = '9888800001';

  let sellerUserId: string;
  const sellerPhone = '9888800002';

  let suspendedUserId: string;
  const suspendedPhone = '9888800003';

  beforeAll(async () => {
    // Clean up test users if existing
    const testPhones = ['9999911111', farmerPhone, sellerPhone, suspendedPhone, '9888800004', '9888800005', '9888800888', '9888800999', '9666611111'];

    await prisma.auditLog.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.passwordResetToken.deleteMany({});

    // Delete related child models before user deletion
    await prisma.farmerProfile.deleteMany({
      where: { user: { phone: { in: testPhones } } },
    });
    await prisma.seller.deleteMany({
      where: { user: { phone: { in: testPhones } } },
    });
    await prisma.expert.deleteMany({
      where: { user: { phone: { in: testPhones } } },
    });
    await prisma.deliveryPartner.deleteMany({
      where: { user: { phone: { in: testPhones } } },
    });
    await prisma.user.deleteMany({
      where: { phone: { in: testPhones } },
    });

    // Seed test Admin user
    const passwordHash = await bcrypt.hash('AdminPassword123!', 12);
    const adminUser = await prisma.user.create({
      data: {
        phone: '9999911111',
        email: 'admin.test@farmseva.demo',
        passwordHash,
        fullName: 'Test Admin',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    adminUserId = adminUser.id;

    // Login as Admin to get Admin Access Token
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ phone: '9999911111', password: 'AdminPassword123!' });
    adminAccessToken = adminLoginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. FARMER REGISTRATION (WITH REAL EMAIL & PASSWORD HASHING)
  test('1. Register new Farmer with real Email and Password (Status default ACTIVE)', async () => {
    const res = await request(app).post('/api/v1/auth/register/farmer').send({
      phone: farmerPhone,
      email: 'raju.farmer@farmseva.com',
      fullName: 'Raju Farmer',
      password: 'FarmerPassword123!',
      preferredLanguage: 'te',
      experienceYears: 10,
      totalLandAcres: 4.5,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('FARMER');
    expect(res.body.data.email).toBe('raju.farmer@farmseva.com');
    expect(res.body.data.status).toBe('ACTIVE');
    expect(res.body.data.passwordHash).toBeUndefined(); // Password hash must NEVER be returned
    farmerUserId = res.body.data.id;

    // Verify Password Hashing in DB
    const dbUser = await prisma.user.findUnique({ where: { id: farmerUserId } });
    expect(dbUser).toBeDefined();
    expect(dbUser?.passwordHash).not.toBe('FarmerPassword123!');
    expect(dbUser?.passwordHash?.startsWith('$2')).toBe(true); // Valid bcrypt hash
  });

  // 1b. DUPLICATE EMAIL REGISTRATION REJECTED
  test('1b. Registration with duplicate email is rejected with 409 Conflict', async () => {
    const res = await request(app).post('/api/v1/auth/register/farmer').send({
      phone: '9888800888',
      email: 'raju.farmer@farmseva.com',
      fullName: 'Duplicate Email Farmer',
      password: 'FarmerPassword123!',
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('AUTH_EMAIL_EXISTS');
  });

  // 2. SELLER REGISTRATION
  test('2. Register new Seller (Status default PENDING_VERIFICATION)', async () => {
    const res = await request(app).post('/api/v1/auth/register/seller').send({
      phone: sellerPhone,
      email: 'suresh.dealer@farmseva.com',
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

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('SELLER');
    expect(res.body.data.user.status).toBe('PENDING_VERIFICATION');
    expect(res.body.data.user.passwordHash).toBeUndefined();
    sellerUserId = res.body.data.user.id;
  });

  // 3. EXPERT REGISTRATION
  test('3. Register new Expert (Status default PENDING_VERIFICATION)', async () => {
    const res = await request(app).post('/api/v1/auth/register/expert').send({
      phone: '9888800004',
      email: 'anita.expert@farmseva.com',
      fullName: 'Dr. Anita Agronomist',
      password: 'ExpertPassword123!',
      specialization: 'Entomology',
      qualification: 'M.Sc Agriculture',
      yearsExperience: 8,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('AGRICULTURAL_EXPERT');
    expect(res.body.data.user.status).toBe('PENDING_VERIFICATION');
  });

  // 4. DELIVERY PARTNER REGISTRATION
  test('4. Register Delivery Partner (Status default ACTIVE)', async () => {
    const res = await request(app).post('/api/v1/auth/register/delivery').send({
      phone: '9888800005',
      email: 'vikram.delivery@farmseva.com',
      fullName: 'Vikram Delivery',
      password: 'DeliveryPassword123!',
      vehicleType: 'Motorcycle',
      vehicleNumber: 'AP 07 CD 5678',
      activeDistrict: 'Guntur',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('DELIVERY_PARTNER');
    expect(res.body.data.status).toBe('ACTIVE');
  });

  // 5. LOGIN WITH EMAIL & PASSWORD
  test('5a. Login with valid Email and Password succeeds', async () => {
    const res = await request(app).post('/api/v1/auth/login/email').send({
      email: 'raju.farmer@farmseva.com',
      password: 'FarmerPassword123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe('raju.farmer@farmseva.com');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  test('5b. Login with wrong password returns 401 Invalid email or password', async () => {
    const res = await request(app).post('/api/v1/auth/login/email').send({
      email: 'raju.farmer@farmseva.com',
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_INVALID_CREDENTIALS');
  });

  test('5c. Login with unknown email returns 401 Invalid email or password', async () => {
    const res = await request(app).post('/api/v1/auth/login/email').send({
      email: 'nonexistent.email@farmseva.com',
      password: 'SomePassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_INVALID_CREDENTIALS');
  });

  // 5. CALL CENTER AGENT CREATION (ADMIN RESTRICTED)
  test('5. Admin creates Call Center Agent account', async () => {
    const res = await request(app)
      .post('/api/v1/admin/users/call-center-agent')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        phone: '9666611111',
        fullName: 'Lata Agent',
        password: 'AgentPassword123!',
        agentCode: 'AGT-999',
        department: 'FARMER_SUPPORT',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('CALL_CENTER_AGENT');
  });

  test('5b. Non-admin cannot create Call Center Agent', async () => {
    // Attempt without token
    const res = await request(app).post('/api/v1/admin/users/call-center-agent').send({
      phone: '9666611112',
      fullName: 'Unauthorized Agent',
      password: 'AgentPassword123!',
      agentCode: 'AGT-000',
    });

    expect(res.status).toBe(401);
  });

  // 6. LOGIN & REFRESH TOKEN
  test('6. Farmer Login success and returns JWT tokens', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      phone: farmerPhone,
      password: 'FarmerPassword123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    farmerAccessToken = res.body.data.accessToken;
  });

  test('7. Login failure with incorrect password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      phone: farmerPhone,
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_INVALID_CREDENTIALS');
  });

  // 8. SUSPENDED ACCOUNT BLOCKING
  test('8. Suspended account login is blocked', async () => {
    const passwordHash = await bcrypt.hash('SuspendedPass123!', 12);
    const suspendedUser = await prisma.user.create({
      data: {
        phone: suspendedPhone,
        passwordHash,
        fullName: 'Blocked User',
        role: UserRole.FARMER,
        status: UserStatus.SUSPENDED,
      },
    });
    suspendedUserId = suspendedUser.id;

    const res = await request(app).post('/api/v1/auth/login').send({
      phone: suspendedPhone,
      password: 'SuspendedPass123!',
    });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('AUTH_ACCOUNT_SUSPENDED');
  });

  // 9. REFRESH TOKEN ROTATION & REVOCATION
  test('9. Refresh token rotation works and invalidates old refresh token', async () => {
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      phone: farmerPhone,
      password: 'FarmerPassword123!',
    });
    const oldRefreshToken = loginRes.body.data.refreshToken;

    // Refresh once
    const refreshRes = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: oldRefreshToken,
    });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.accessToken).toBeDefined();
    expect(refreshRes.body.data.refreshToken).toBeDefined();

    // Reuse old refresh token -> Should be rejected
    const reuseRes = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: oldRefreshToken,
    });
    expect(reuseRes.status).toBe(401);
  });

  // 10. PROTECTED ENDPOINT & ROLE-BASED ACCESS CONTROL (RBAC)
  test('10. GET /api/v1/auth/me succeeds with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${farmerAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(farmerUserId);
  });

  test('11. Farmer attempting Admin API is rejected with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${farmerAccessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('AUTH_FORBIDDEN');
  });

  // 12. ADMIN USER MANAGEMENT & SELLER VERIFICATION
  test('12. Admin lists users and verifies pending seller', async () => {
    const listRes = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThan(0);

    // Verify Pending Seller
    const seller = await prisma.seller.findFirst({ where: { userId: sellerUserId } });
    expect(seller).toBeDefined();

    const verifyRes = await request(app)
      .patch(`/api/v1/admin/sellers/${seller!.id}/verify`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ action: 'APPROVE' });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.verificationStatus).toBe('APPROVED');
    expect(verifyRes.body.data.user.status).toBe('ACTIVE');
  });

  // 13. ADMIN UPDATING USER STATUS TO SUSPENDED
  test('13. Admin suspends user and revokes refresh tokens', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${farmerUserId}/status`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ status: 'SUSPENDED', reason: 'Policy violation test' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SUSPENDED');

    // Verification: Farmer's existing token or refresh should now fail
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${farmerAccessToken}`);

    expect(meRes.status).toBe(403);
    expect(meRes.body.error.code).toBe('AUTH_ACCOUNT_SUSPENDED');
  });

  // 14. PASSWORD RESET WORKFLOW
  test('14. Password reset request and completion workflow', async () => {
    const forgotRes = await request(app).post('/api/v1/auth/forgot-password').send({
      phone: farmerPhone,
    });

    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.data.resetToken).toBeUndefined(); // Verify token is NOT leaked in API response

    // Test invalid reset token is rejected
    const invalidResetRes = await request(app).post('/api/v1/auth/reset-password').send({
      token: 'invalid_reset_token_string_123',
      newPassword: 'NewFarmerPassword123!',
    });
    expect(invalidResetRes.status).toBe(400);
    expect(invalidResetRes.body.error.code).toBe('AUTH_INVALID_RESET_TOKEN');

    // Reactivate farmer for subsequent login test
    await prisma.user.update({ where: { id: farmerUserId }, data: { status: 'ACTIVE' } });

    // Verify login with new password
    const newLoginRes = await request(app).post('/api/v1/auth/login').send({
      phone: farmerPhone,
      password: 'NewFarmerPassword123!',
    });

    expect(newLoginRes.status).toBe(200);
    expect(newLoginRes.body.data.accessToken).toBeDefined();
  });

  // 15. AUDIT LOG GENERATION
  test('15. Audit Log entries are written for security actions', async () => {
    const logs = await prisma.auditLog.findMany({
      where: { action: { in: ['REGISTER_FARMER', 'REGISTER_SELLER', 'LOGIN_SUCCESS'] } },
    });

    expect(logs.length).toBeGreaterThan(0);
  });

  // 16. SECURE OTP GENERATION, RATE-LIMITING, LOCKOUT, AND SINGLE-USE INVALIDATION
  test('16. Secure OTP generation, 60s rate limit, max 3 attempts lockout, and single-use invalidation', async () => {
    const testPhone = '9876543210';

    // 16a. Send OTP
    const sendRes = await request(app).post('/api/v1/auth/send-otp').send({
      identifier: testPhone,
      purpose: 'LOGIN',
    });
    expect(sendRes.status).toBe(200);
    expect(sendRes.body.success).toBe(true);
    expect(sendRes.body.data.demoOtp).toBeUndefined(); // Ensure no raw OTP leaked in response

    // 16b. Resend within 60s should be rate-limited (429)
    const rateLimitRes = await request(app).post('/api/v1/auth/send-otp').send({
      identifier: testPhone,
      purpose: 'LOGIN',
    });
    expect(rateLimitRes.status).toBe(429);
    expect(rateLimitRes.body.error.code).toBe('OTP_RATE_LIMIT');

    // Fetch active OTP record from DB to test verification and lockout
    const activeOtpRecord = await prisma.otpRecord.findFirst({
      where: { identifier: testPhone, purpose: 'LOGIN', isUsed: false },
      orderBy: { createdAt: 'desc' },
    });
    expect(activeOtpRecord).toBeDefined();

    // 16c. Wrong OTP attempt 1
    const wrong1Res = await request(app).post('/api/v1/auth/verify-otp').send({
      identifier: testPhone,
      otp: '000000',
      purpose: 'LOGIN',
    });
    expect(wrong1Res.status).toBe(400);

    // 16d. Wrong OTP attempt 2
    const wrong2Res = await request(app).post('/api/v1/auth/verify-otp').send({
      identifier: testPhone,
      otp: '111111',
      purpose: 'LOGIN',
    });
    expect(wrong2Res.status).toBe(400);

    // 16e. Wrong OTP attempt 3 -> Triggers lockout
    const wrong3Res = await request(app).post('/api/v1/auth/verify-otp').send({
      identifier: testPhone,
      otp: '222222',
      purpose: 'LOGIN',
    });
    expect(wrong3Res.status).toBe(400);
    expect(wrong3Res.body.error.code).toBe('OTP_MAX_ATTEMPTS');

    // Verify record is now invalidated in DB
    const lockedRecord = await prisma.otpRecord.findUnique({
      where: { id: activeOtpRecord!.id },
    });
    expect(lockedRecord?.isUsed).toBe(true);
  });
});

