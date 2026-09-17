import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import { UserRole, UserStatus } from '@farm-seva/shared';
import bcrypt from 'bcryptjs';
import { AuthService } from '../services/auth-service';
import { OtpService } from '../services/otp-service';

const prisma = new PrismaClient();

describe('FARM SEVA — Step 2: Identity Normalization & Account Linking Test Suite', () => {
  const testPhones = [
    '9700011101',
    '9700011102',
    '9700011103',
    '9700011104',
    '9700011105',
    '9700011106',
    '9700011107',
  ];

  const testEmails = [
    'farmer.test@gmail.com',
    'google.link.test@farmseva.com',
    'brandnew.farmer@gmail.com',
    'collision.test@gmail.com',
  ];

  beforeAll(async () => {
    // Cleanup prior test artifacts
    await prisma.otpRecord.deleteMany({
      where: {
        OR: [
          { identifier: { in: testPhones } },
          { identifier: { in: testEmails } },
        ],
      },
    });

    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          OR: [
            { phone: { in: testPhones } },
            { email: { in: testEmails } },
          ],
        },
      },
    });

    await prisma.farmerProfile.deleteMany({
      where: {
        user: {
          OR: [
            { phone: { in: testPhones } },
            { email: { in: testEmails } },
          ],
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        OR: [
          { phone: { in: testPhones } },
          { email: { in: testEmails } },
          { googleId: { in: ['g-uid-999', 'g-uid-1001', 'g-uid-1002'] } },
        ],
      },
    });
  });

  afterAll(async () => {
    await prisma.otpRecord.deleteMany({
      where: {
        OR: [
          { identifier: { in: testPhones } },
          { identifier: { in: testEmails } },
        ],
      },
    });

    await prisma.refreshToken.deleteMany({
      where: {
        user: {
          OR: [
            { phone: { in: testPhones } },
            { email: { in: testEmails } },
          ],
        },
      },
    });

    await prisma.farmerProfile.deleteMany({
      where: {
        user: {
          OR: [
            { phone: { in: testPhones } },
            { email: { in: testEmails } },
          ],
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        OR: [
          { phone: { in: testPhones } },
          { email: { in: testEmails } },
          { googleId: { in: ['g-uid-999', 'g-uid-1001', 'g-uid-1002'] } },
        ],
      },
    });

    await prisma.$disconnect();
  });

  // ==================================================
  // TEST A: EMAIL NORMALIZATION
  // ==================================================
  describe('A. Email Normalization', () => {
    it('should normalize uppercase email during registration and prevent duplicate mixed-case registration', async () => {
      // 1. Register with mixed-case email
      const res1 = await request(app)
        .post('/api/v1/auth/register/farmer')
        .send({
          phone: '9700011101',
          email: 'Farmer.Test@GMAIL.COM',
          fullName: 'Farmer Ramesh',
          password: 'Password123!',
          experienceYears: 5,
        });

      expect(res1.status).toBe(201);
      expect(res1.body.success).toBe(true);
      expect(res1.body.data.email).toBe('farmer.test@gmail.com');

      // 2. Attempt registering another user with lowercase version -> must reject with 409
      const res2 = await request(app)
        .post('/api/v1/auth/register/farmer')
        .send({
          phone: '9700011103',
          email: 'farmer.test@gmail.com',
          fullName: 'Farmer Suresh',
          password: 'Password123!',
        });

      expect(res2.status).toBe(409);
      expect(res2.body.error.code).toBe('AUTH_EMAIL_EXISTS');
    });

    it('should allow logging in with any case variation of the registered email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone: 'FARMER.TEST@GMAIL.COM',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('farmer.test@gmail.com');
      expect(res.body.data.accessToken).toBeDefined();
    });
  });

  // ==================================================
  // TEST B: PHONE NORMALIZATION
  // ==================================================
  describe('B. Phone Normalization', () => {
    it('should normalize Indian phone with +91 and spaces to canonical 10-digit format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register/farmer')
        .send({
          phone: '+91 97000 11102',
          fullName: 'Farmer Rajesh',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.phone).toBe('9700011102');

      // Verify in DB directly
      const dbUser = await prisma.user.findUnique({ where: { phone: '9700011102' } });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.phone).toBe('9700011102');
    });

    it('should authenticate user with formatted phone variants (+91-..., +91 ..., 0...)', async () => {
      // Login with +91-97000-11102
      const res1 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone: '+91-9700011102',
          password: 'Password123!',
        });

      expect(res1.status).toBe(200);
      expect(res1.body.data.user.phone).toBe('9700011102');

      // Login with 09700011102
      const res2 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone: '09700011102',
          password: 'Password123!',
        });

      expect(res2.status).toBe(200);
      expect(res2.body.data.user.phone).toBe('9700011102');
    });

    it('should reject invalid Indian phone numbers safely', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register/farmer')
        .send({
          phone: '1234567890', // Does not start with 6-9
          fullName: 'Invalid Phone Farmer',
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
    });
  });

  // ==================================================
  // TEST C: GOOGLE EXISTING EMAIL LINKING
  // ==================================================
  describe('C. Google Existing Email Linking', () => {
    let existingUserId: string;

    beforeAll(async () => {
      // Create local user with email
      const localUser = await AuthService.registerFarmer({
        phone: '9700011104',
        email: 'google.link.test@farmseva.com',
        fullName: 'Local User',
        password: 'Password123!',
      });
      existingUserId = localUser.id;
    });

    it('should link verified Google account to existing user with matching email without creating duplicate', async () => {
      const result = await AuthService.loginWithGoogle({
        googleId: 'g-uid-999',
        email: 'Google.Link.Test@FarmSeva.COM', // Mixed case
        emailVerified: true,
        fullName: 'Google User Name',
      });

      // Must resolve to the exact same User ID
      expect(result.user.id).toBe(existingUserId);
      expect(result.user.email).toBe('google.link.test@farmseva.com');

      // Check DB directly
      const updatedUser = await prisma.user.findUnique({ where: { id: existingUserId } });
      expect(updatedUser?.googleId).toBe('g-uid-999');
      expect(updatedUser?.emailVerified).toBe(true);

      // Verify no duplicate users exist with this email
      const count = await prisma.user.count({
        where: { email: { equals: 'google.link.test@farmseva.com', mode: 'insensitive' } },
      });
      expect(count).toBe(1);
    });
  });

  // ==================================================
  // TEST D: GOOGLE VERIFIED EMAIL ENFORCEMENT
  // ==================================================
  describe('D. Google Verified Email Requirement', () => {
    it('should strictly reject Google login if Google email is not verified', async () => {
      await expect(
        AuthService.loginWithGoogle({
          googleId: 'g-uid-unverified',
          email: 'unverified@gmail.com',
          emailVerified: false,
          fullName: 'Unverified Farmer',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'AUTH_EMAIL_UNVERIFIED',
      });
    });
  });

  // ==================================================
  // TEST E: PHONE-ONLY + GOOGLE PROTECTION
  // ==================================================
  describe('E. Phone-Only Account + Google Protection', () => {
    let phoneOnlyUserId: string;

    beforeAll(async () => {
      // Create phone-only user
      const user = await AuthService.registerFarmer({
        phone: '9700011105',
        fullName: 'Phone Only Farmer',
        password: 'Password123!',
      });
      phoneOnlyUserId = user.id;
    });

    it('must NOT silently merge a new Google account with an existing phone-only account', async () => {
      const googleResult = await AuthService.loginWithGoogle({
        googleId: 'g-uid-1001',
        email: 'brandnew.farmer@gmail.com',
        emailVerified: true,
        fullName: 'Brand New Google Farmer',
      });

      // Google user must be a distinct new user, NOT merged with phoneOnlyUserId
      expect(googleResult.user.id).not.toBe(phoneOnlyUserId);
      expect(googleResult.user.phone).toBeNull();
      expect(googleResult.user.phoneVerified).toBe(false);

      // Phone-only user must remain untouched
      const phoneUser = await prisma.user.findUnique({ where: { id: phoneOnlyUserId } });
      expect(phoneUser?.email).toBeNull();
      expect(phoneUser?.googleId).toBeNull();
    });
  });

  // ==================================================
  // TEST F: GOOGLE USER → PHONE LINKING
  // ==================================================
  describe('F. Authenticated Google User Phone Linking', () => {
    let googleUserToken: string;
    let googleUserId: string;

    beforeAll(async () => {
      const result = await AuthService.loginWithGoogle({
        googleId: 'g-uid-1002',
        email: 'collision.test@gmail.com',
        emailVerified: true,
        fullName: 'Phone Link Tester',
      });
      googleUserId = result.user.id;
      googleUserToken = result.accessToken;
    });

    it('should request OTP and link verified phone number to Google user account', async () => {
      const targetPhone = '+91 97000 11106';
      const canonicalPhone = '9700011106';

      // 1. Request OTP
      const otpRes = await request(app)
        .post('/api/v1/auth/link-phone/otp')
        .set('Authorization', `Bearer ${googleUserToken}`)
        .send({ phone: targetPhone });

      expect(otpRes.status).toBe(200);
      expect(otpRes.body.success).toBe(true);

      // Fetch the generated OTP from DB for testing
      const otpRecord = await prisma.otpRecord.findFirst({
        where: { identifier: canonicalPhone, purpose: 'PHONE_LINK' },
        orderBy: { createdAt: 'desc' },
      });
      expect(otpRecord).not.toBeNull();

      // In tests, we can verify using the matching plain OTP or simulate linkPhone
      // Since OtpService hashes OTP, let's create a known test OTP hash
      const testOtp = '654321';
      const testOtpHash = await bcrypt.hash(testOtp, 8);
      await prisma.otpRecord.update({
        where: { id: otpRecord!.id },
        data: { otpHash: testOtpHash },
      });

      // 2. Submit link-phone verification
      const linkRes = await request(app)
        .post('/api/v1/auth/link-phone')
        .set('Authorization', `Bearer ${googleUserToken}`)
        .send({ phone: targetPhone, otp: testOtp });

      expect(linkRes.status).toBe(200);
      expect(linkRes.body.success).toBe(true);
      expect(linkRes.body.data.user.phone).toBe(canonicalPhone);
      expect(linkRes.body.data.user.phoneVerified).toBe(true);
      expect(linkRes.body.data.user.id).toBe(googleUserId); // Retains same User ID!
    });

    // ==================================================
    // TEST G: PHONE COLLISION (NO OVERWRITE)
    // ==================================================
    describe('G. Phone Collision Safe Conflict Response', () => {
      it('should reject linking a phone number that already belongs to another account', async () => {
        // Create another user
        const otherUserResult = await AuthService.loginWithGoogle({
          googleId: 'g-uid-other-1003',
          email: 'other.farmer@gmail.com',
          emailVerified: true,
          fullName: 'Other Farmer',
        });

        // Try linking phone 9700011106 (already owned by googleUserId)
        const res = await request(app)
          .post('/api/v1/auth/link-phone/otp')
          .set('Authorization', `Bearer ${otherUserResult.accessToken}`)
          .send({ phone: '9700011106' });

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe('PHONE_ALREADY_LINKED');

        // Verify original owner still owns the phone
        const originalOwner = await prisma.user.findUnique({ where: { phone: '9700011106' } });
        expect(originalOwner?.id).toBe(googleUserId);

        // Cleanup other user
        await prisma.refreshToken.deleteMany({ where: { userId: otherUserResult.user.id } });
        await prisma.farmerProfile.deleteMany({ where: { userId: otherUserResult.user.id } });
        await prisma.user.deleteMany({ where: { id: otherUserResult.user.id } });
      });
    });

    // ==================================================
    // TEST H: RETURNING LOGIN PRESERVES IDENTITY & DATA
    // ==================================================
    describe('H. Returning Login Preserves Identity and Business Data', () => {
      it('should recognize returning user and maintain identical User ID and data', async () => {
        // Create a farm for googleUserId
        const profile = await prisma.farmerProfile.findUnique({ where: { userId: googleUserId } });
        expect(profile).not.toBeNull();

        const farm = await prisma.farm.create({
          data: {
            farmerId: profile!.id,
            name: 'Paddy Green Fields',
            locationDistrict: 'Warangal',
            locationState: 'Telangana',
            totalAreaAcres: 5.5,
          },
        });

        // 1. Logout
        const logoutRes = await request(app)
          .post('/api/v1/auth/logout')
          .set('Authorization', `Bearer ${googleUserToken}`);
        expect(logoutRes.status).toBe(200);

        // 2. Login again via Google
        const reloginResult = await AuthService.loginWithGoogle({
          googleId: 'g-uid-1002',
          email: 'collision.test@gmail.com',
          emailVerified: true,
          fullName: 'Phone Link Tester',
        });

        expect(reloginResult.user.id).toBe(googleUserId);

        // 3. Verify farm data remains intact
        const farms = await prisma.farm.findMany({ where: { farmerId: profile!.id } });
        expect(farms.length).toBe(1);
        expect(farms[0].id).toBe(farm.id);
        expect(farms[0].name).toBe('Paddy Green Fields');

        // Clean up farm
        await prisma.farm.delete({ where: { id: farm.id } });
      });
    });

    // ==================================================
    // PASSWORD ESTABLISHMENT FOR GOOGLE USER
    // ==================================================
    describe('Password Setup for Google User', () => {
      it('should securely establish a password for a Google user without password', async () => {
        const res = await request(app)
          .post('/api/v1/auth/set-password')
          .set('Authorization', `Bearer ${googleUserToken}`)
          .send({ password: 'GooglePassword123!' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        // User can now log in with email and password!
        const loginRes = await request(app)
          .post('/api/v1/auth/login')
          .send({
            phone: 'collision.test@gmail.com',
            password: 'GooglePassword123!',
          });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body.data.user.id).toBe(googleUserId);

        // Attempting to set password again should fail
        const duplicateSetRes = await request(app)
          .post('/api/v1/auth/set-password')
          .set('Authorization', `Bearer ${googleUserToken}`)
          .send({ password: 'AnotherPassword123!' });

        expect(duplicateSetRes.status).toBe(400);
        expect(duplicateSetRes.body.error.code).toBe('PASSWORD_ALREADY_SET');
      });
    });
  });
});
