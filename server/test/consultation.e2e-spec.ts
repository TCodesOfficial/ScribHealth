import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Consultation', () => {
  let app: INestApplication;
  let authCookie: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth cookie
    await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send({
        email: 'test@hospital.com',
        password: 'Welcome123',
      })
      .expect(200);

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send({
        email: 'test@hospital.com',
        password: 'Welcome123',
      });

    authCookie = loginRes.headers['set-cookie']?.[0]?.split(';')[0];
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/consultation/process-audio', () => {
    it('should process audio and return consultation record', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/consultation/process-audio')
        .set('Cookie', authCookie)
        .field('patientIdentifier', 'PT-12345')
        .attach('file', Buffer.alloc(100, 0), 'test.wav')
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('rawTranscript');
    });

    it('should return 400 without file', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/consultation/process-audio')
        .set('Cookie', authCookie)
        .expect(400);
    });
  });

  describe('GET /api/consultation/history', () => {
    it('should return consultation history', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/consultation/history')
        .set('Cookie', authCookie)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/consultation/:id', () => {
    it('should return a single consultation', async () => {
      // First create a consultation
      const createRes = await request(app.getHttpServer())
        .post('/api/consultation/process-audio')
        .set('Cookie', authCookie)
        .field('patientIdentifier', 'PT-67890')
        .attach('file', Buffer.alloc(100, 0), 'test2.wav')
        .expect(201);

      const consultationId = createRes.body.data.id;

      // Then fetch it
      const res = await request(app.getHttpServer())
        .get(`/api/consultation/${consultationId}`)
        .set('Cookie', authCookie)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data.id).toBe(consultationId);
    });

    it('should return 404 for non-existent consultation', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/consultation/nonexistent-id')
        .set('Cookie', authCookie)
        .expect(404);
    });
  });
});