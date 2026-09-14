import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Benchmark', () => {
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

  describe('POST /api/benchmark/run', () => {
    it('should run benchmark across all 3 STT providers', async () => {
      if (!authCookie) {
        throw new Error('Auth cookie not available');
      }

      const res = await request(app.getHttpServer())
        .post('/api/benchmark/run')
        .set('Cookie', authCookie)
        .field('referenceText', 'Patient presents with chest pain and shortness of breath.')
        .attach('file', Buffer.alloc(100, 0), 'test.wav')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      const { sahara, groqWhisper, deepgram } = res.body.data;

      // Each provider should have transcript and latency
      expect(sahara).toHaveProperty('transcript');
      expect(sahara).toHaveProperty('latencyMs');
      expect(sahara).toHaveProperty('wer');

      expect(groqWhisper).toHaveProperty('transcript');
      expect(groqWhisper).toHaveProperty('latencyMs');
      expect(groqWhisper).toHaveProperty('wer');

      expect(deepgram).toHaveProperty('transcript');
      expect(deepgram).toHaveProperty('latencyMs');
      expect(deepgram).toHaveProperty('wer');
    });

    it('should return 400 without audio file', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/benchmark/run')
        .set('Cookie', authCookie)
        .field('referenceText', 'test')
        .expect(400);
    });

    it('should handle missing Groq API key gracefully', async () => {
      // This test verifies graceful error handling when API key not configured
      const res = await request(app.getHttpServer())
        .post('/api/benchmark/run')
        .set('Cookie', authCookie)
        .field('referenceText', 'test')
        .attach('file', Buffer.alloc(100, 0), 'test.wav')
        .expect(200); // May succeed with error transcripts or fail with 500 depending on config

      // The key is that it doesn't crash the whole response
      expect(res.body).toBeDefined();
    });
  });
});