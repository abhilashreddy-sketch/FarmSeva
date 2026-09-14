import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('FARM SEVA AI Crop Doctor Suite', () => {
  let farmerAccessToken: string;
  let farmerUserId: string;
  const farmerPhone = '9777700001';

  let farmerBToken: string;
  let farmerBUserId: string;
  const farmerBPhone = '9777700002';

  beforeAll(async () => {
    // Clean test users
    await prisma.cropDiagnosisImage.deleteMany({});
    await prisma.cropDiagnosis.deleteMany({});
    await prisma.cropProblemImage.deleteMany({});
    await prisma.consultationMessage.deleteMany({});
    await prisma.consultation.deleteMany({});
    await prisma.cropProblem.deleteMany({});
    await prisma.user.deleteMany({
      where: { phone: { in: [farmerPhone, farmerBPhone] } },
    });

    // Seed Farmer A
    const passwordHash = await bcrypt.hash('FarmerPass123!', 10);
    const user = await prisma.user.create({
      data: {
        phone: farmerPhone,
        passwordHash,
        fullName: 'Ramulu Farmer',
        role: 'FARMER',
        status: 'ACTIVE',
        farmerProfile: {
          create: {
            district: 'Warangal',
            state: 'Telangana',
          },
        },
      },
    });
    farmerUserId = user.id;

    // Login Farmer A
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      phone: farmerPhone,
      password: 'FarmerPass123!',
    });
    expect(loginRes.status).toBe(200);
    farmerAccessToken = loginRes.body.data.accessToken;
    farmerUserId = loginRes.body.data.user.id;

    // Seed & Login Farmer B
    await prisma.user.create({
      data: {
        phone: farmerBPhone,
        passwordHash,
        fullName: 'Srinivas Farmer B',
        role: 'FARMER',
        status: 'ACTIVE',
        farmerProfile: {
          create: {
            district: 'Karimnagar',
            state: 'Telangana',
          },
        },
      },
    });
    const loginBRes = await request(app).post('/api/v1/auth/login').send({
      phone: farmerBPhone,
      password: 'FarmerPass123!',
    });
    expect(loginBRes.status).toBe(200);
    farmerBToken = loginBRes.body.data.accessToken;
    farmerBUserId = loginBRes.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. UNAUTHENTICATED ACCESS REJECTED
  test('1. Unauthenticated request to /api/v1/crop-doctor/analyze is rejected with 401', async () => {
    const res = await request(app).post('/api/v1/crop-doctor/analyze');
    expect(res.status).toBe(401);
  });

  // 2. NO IMAGES ATTACHED REJECTED
  test('2. Request without photo attachments is rejected with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/v1/crop-doctor/analyze')
      .set('Authorization', `Bearer ${farmerAccessToken}`)
      .field('crop', 'Rice')
      .field('problemLocation', 'Leaf');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NO_IMAGES_PROVIDED');
  });

  // 3. INVALID FILE TYPE REJECTED
  test('3. Request with unsupported file type is rejected with 400', async () => {
    const res = await request(app)
      .post('/api/v1/crop-doctor/analyze')
      .set('Authorization', `Bearer ${farmerAccessToken}`)
      .attach('photos', Buffer.from('dummy text content'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_IMAGE_FORMAT');
  });

  // 4. SERVICE_NOT_CONFIGURED STATUS WHEN GEMINI_API_KEY NOT SET
  test('4. Real AI call returns 503 SERVICE_NOT_CONFIGURED when GEMINI_API_KEY is not set', async () => {
    const originalGeminiKey = process.env.GEMINI_API_KEY;
    const originalAiKey = process.env.AI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.AI_API_KEY;

    // Create a 1x1 valid PNG image buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    try {
      const res = await request(app)
        .post('/api/v1/crop-doctor/analyze')
        .set('Authorization', `Bearer ${farmerAccessToken}`)
        .attach('photos', pngBuffer, { filename: 'leaf.png', contentType: 'image/png' })
        .field('crop', 'Rice')
        .field('preferredLanguage', 'te');

      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe('SERVICE_NOT_CONFIGURED');
    } finally {
      if (originalGeminiKey) process.env.GEMINI_API_KEY = originalGeminiKey;
      if (originalAiKey) process.env.AI_API_KEY = originalAiKey;
    }
  });

  // 5. DB PERSISTENCE & HISTORY RETRIEVAL
  test('5. CropDiagnosis DB persistence and history listing endpoint works', async () => {
    // Seed a diagnosis directly in DB to test listing & escalation
    const diag = await prisma.cropDiagnosis.create({
      data: {
        userId: farmerUserId,
        cropName: 'Cotton',
        cropConfidence: 90,
        primaryProblem: 'Pink Bollworm',
        problemType: 'PEST',
        confidence: 65, // Below 70 -> needsExpert = true
        observationsJson: JSON.stringify(['Holes in bolls', 'Boll drop']),
        possibleCausesJson: JSON.stringify(['Pectinophora gossypiella infestation']),
        recommendedActionsJson: JSON.stringify(['Deploy pheromone traps', 'Destroy affected bolls']),
        preventionJson: JSON.stringify(['Use resistant varieties', 'Crop rotation']),
        medicineGuidanceJson: JSON.stringify(['Recommended insecticides']),
        selectedLanguage: 'te',
        imageQualityJson: JSON.stringify({ acceptable: true, reason: 'Clear' }),
        needsExpert: true,
        expertReason: 'AI confidence rating (65%) is below threshold.',
        images: {
          create: [{ imageUrl: '/uploads/boll.png', fileType: 'image/png', fileSize: 1024 }],
        },
      },
    });

    const historyRes = await request(app)
      .get('/api/v1/crop-doctor/history')
      .set('Authorization', `Bearer ${farmerAccessToken}`);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.success).toBe(true);
    expect(historyRes.body.data.length).toBeGreaterThan(0);
    expect(historyRes.body.data[0].primaryProblem).toBe('Pink Bollworm');

    // Test Get By ID
    const singleRes = await request(app)
      .get(`/api/v1/crop-doctor/${diag.id}`)
      .set('Authorization', `Bearer ${farmerAccessToken}`);

    expect(singleRes.status).toBe(200);
    expect(singleRes.body.data.id).toBe(diag.id);
  });

  // 6. EXPERT ESCALATION WORKFLOW
  test('6. Escalates low confidence diagnosis to official FARM SEVA Expert Consultation', async () => {
    const diag = await prisma.cropDiagnosis.findFirst({ where: { userId: farmerUserId } });
    expect(diag).toBeDefined();

    const escalateRes = await request(app)
      .post(`/api/v1/crop-doctor/${diag!.id}/escalate`)
      .set('Authorization', `Bearer ${farmerAccessToken}`)
      .send({ farmerNotes: 'Urgent expert guidance needed for bollworm control' });

    expect(escalateRes.status).toBe(200);
    expect(escalateRes.body.success).toBe(true);
    expect(escalateRes.body.data.cropProblemId).toBeDefined();
    expect(escalateRes.body.data.consultationId).toBeDefined();

    // Verify CropProblem and Consultation created in DB
    const problem = await prisma.cropProblem.findUnique({
      where: { id: escalateRes.body.data.cropProblemId },
      include: { images: true, consultation: true },
    });

    expect(problem).toBeDefined();
    expect(problem?.status).toBe('OPEN');
    expect(problem?.consultation).toBeDefined();
    expect(problem?.images.length).toBeGreaterThan(0);
  });

  // 7. SECURITY AUTHORIZATION ENFORCEMENT
  test("7. Security: User B cannot access or escalate User A's crop diagnosis record (returns 403)", async () => {
    const diag = await prisma.cropDiagnosis.findFirst({ where: { userId: farmerUserId } });
    expect(diag).toBeDefined();

    // User B attempts to read User A's diagnosis
    const forbiddenGet = await request(app)
      .get(`/api/v1/crop-doctor/${diag!.id}`)
      .set('Authorization', `Bearer ${farmerBToken}`);
    expect(forbiddenGet.status).toBe(403);
    expect(forbiddenGet.body.error.code).toBe('ACCESS_DENIED');

    // User B attempts to escalate User A's diagnosis
    const forbiddenEscalate = await request(app)
      .post(`/api/v1/crop-doctor/${diag!.id}/escalate`)
      .set('Authorization', `Bearer ${farmerBToken}`)
      .send({ farmerNotes: 'Unauthorized escalation attempt' });
    expect(forbiddenEscalate.status).toBe(403);
    expect(forbiddenEscalate.body.error.code).toBe('ACCESS_DENIED');
  });
});
