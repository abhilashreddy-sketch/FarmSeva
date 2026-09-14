import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import { GoogleAuthProvider } from '../providers/google-auth-provider';
import { env } from '../config/env';

const prisma = new PrismaClient();

describe('Google OAuth 2.0 & OpenID Connect Authentication API', () => {
  const testEmail = 'oauth.farmer@example.com';
  const testGoogleId = 'google-uid-123456789';

  beforeAll(async () => {
    // Configure test OAuth env values
    (env as any).GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
    (env as any).GOOGLE_CLIENT_SECRET = 'test-client-secret-123';
    (env as any).GOOGLE_REDIRECT_URI = 'http://localhost:4000/api/v1/auth/google/callback';

    // Clean up test database
    await prisma.refreshToken.deleteMany({
      where: { user: { email: testEmail } },
    });
    await prisma.auditLog.deleteMany({
      where: { user: { email: testEmail } },
    });
    await prisma.farmerProfile.deleteMany({
      where: { user: { email: testEmail } },
    });
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({
      where: { user: { email: testEmail } },
    });
    await prisma.auditLog.deleteMany({
      where: { user: { email: testEmail } },
    });
    await prisma.farmerProfile.deleteMany({
      where: { user: { email: testEmail } },
    });
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    await prisma.$disconnect();
  });

  describe('1. Google OAuth Initiation Endpoint', () => {
    it('GET /api/v1/auth/google should return official Google authorization URL', async () => {
      const res = await request(app).get('/api/v1/auth/google');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(res.body.data.url).toContain('client_id=test-client-id.apps.googleusercontent.com');
      expect(res.body.data.url).toContain('openid');
    });

    it('GET /api/v1/auth/google?redirect=true should issue 302 redirect to Google', async () => {
      const res = await request(app).get('/api/v1/auth/google?redirect=true');
      expect(res.status).toBe(302);
      expect(res.header.location).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    });
  });

  describe('2. New Google User Registration (Case 1)', () => {
    it('POST /api/v1/auth/google should register new Google user and return FARM SEVA JWT session', async () => {
      jest.spyOn(GoogleAuthProvider, 'verifyCode').mockResolvedValueOnce({
        googleId: testGoogleId,
        email: testEmail,
        emailVerified: true,
        fullName: 'OAuth Farmer User',
        avatarUrl: 'https://lh3.googleusercontent.com/a/test-avatar',
      });

      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({ code: 'valid-google-authorization-code' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.googleId).toBe(testGoogleId);
      expect(res.body.data.user.authProvider).toBe('GOOGLE');
      expect(res.body.data.user.emailVerified).toBe(true);

      // Verify user in database
      const dbUser = await prisma.user.findFirst({ where: { email: testEmail } });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.googleId).toBe(testGoogleId);
      expect(dbUser?.role).toBe('FARMER');
    });
  });

  describe('3. Account Linking with Existing Email User (Case 2 & Case 3)', () => {
    const existingUserEmail = 'existing.local.farmer@example.com';
    const existingGoogleId = 'google-uid-linking-999';

    beforeAll(async () => {
      await prisma.user.create({
        data: {
          fullName: 'Local Pre-existing Farmer',
          email: existingUserEmail,
          phone: '+919998887766',
          passwordHash: 'hashed-password-string',
          role: 'FARMER',
          status: 'ACTIVE',
          emailVerified: false, // Initially unverified local account
        },
      });
    });

    afterAll(async () => {
      await prisma.refreshToken.deleteMany({ where: { user: { email: existingUserEmail } } });
      await prisma.farmerProfile.deleteMany({ where: { user: { email: existingUserEmail } } });
      await prisma.user.deleteMany({ where: { email: existingUserEmail } });
    });

    it('should link Google identity to existing account with same email without creating duplicate user', async () => {
      jest.spyOn(GoogleAuthProvider, 'verifyCode').mockResolvedValueOnce({
        googleId: existingGoogleId,
        email: existingUserEmail,
        emailVerified: true,
        fullName: 'Local Pre-existing Farmer',
        avatarUrl: 'https://lh3.googleusercontent.com/avatar',
      });

      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({ code: 'valid-linking-code' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(existingUserEmail);
      expect(res.body.data.user.googleId).toBe(existingGoogleId);
      expect(res.body.data.user.emailVerified).toBe(true); // Updated to true upon linking verified Google email

      // Confirm duplicate user was NOT created
      const userCount = await prisma.user.count({ where: { email: existingUserEmail } });
      expect(userCount).toBe(1);
    });

    it('subsequent Google login for existing linked user should succeed normally', async () => {
      jest.spyOn(GoogleAuthProvider, 'verifyIdToken').mockResolvedValueOnce({
        googleId: existingGoogleId,
        email: existingUserEmail,
        emailVerified: true,
        fullName: 'Local Pre-existing Farmer',
      });

      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({ idToken: 'valid-linked-id-token' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.googleId).toBe(existingGoogleId);
    });
  });

  describe('4. Security & Error Handling Validation', () => {
    it('should REJECT login if Google email is not verified (Case 4)', async () => {
      jest.spyOn(GoogleAuthProvider, 'verifyIdToken').mockResolvedValueOnce({
        googleId: 'unverified-google-uid',
        email: 'unverified.user@gmail.com',
        emailVerified: false, // Unverified Google email!
        fullName: 'Unverified User',
      });

      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({ idToken: 'id-token-unverified-email' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_EMAIL_UNVERIFIED');
    });

    it('should return 401 when invalid or expired Google ID token is provided', async () => {
      jest.spyOn(GoogleAuthProvider, 'verifyIdToken').mockRejectedValueOnce({
        statusCode: 401,
        code: 'AUTH_INVALID_GOOGLE_TOKEN',
        message: 'Google ID token verification failed or token is expired/invalid.',
      });

      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({ idToken: 'invalid-expired-token' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_INVALID_GOOGLE_TOKEN');
    });

    it('should return 401 when wrong audience / client ID is used', async () => {
      jest.spyOn(GoogleAuthProvider, 'verifyIdToken').mockRejectedValueOnce({
        statusCode: 401,
        code: 'AUTH_INVALID_GOOGLE_TOKEN',
        message: 'Token audience mismatch: expected client ID does not match token aud claim.',
      });

      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({ idToken: 'wrong-audience-token' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_INVALID_GOOGLE_TOKEN');
    });
  });

  describe('5. Session Management & Logout', () => {
    it('should allow user authenticated via Google to logout and invalidate session', async () => {
      // First login with Google
      jest.spyOn(GoogleAuthProvider, 'verifyCode').mockResolvedValueOnce({
        googleId: testGoogleId,
        email: testEmail,
        emailVerified: true,
        fullName: 'OAuth Farmer User',
      });

      const loginRes = await request(app)
        .post('/api/v1/auth/google')
        .send({ code: 'valid-code' });

      const { accessToken, refreshToken } = loginRes.body.data;

      // Logout using FARM SEVA JWT
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);
    });
  });
});
