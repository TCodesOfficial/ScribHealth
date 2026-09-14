import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Auth', () => {
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

  describe('Sign Up', () => {
    it('should register a new hospital account', async () => {
      const hospitalData = {
        email: 'test@hospital.com',
        password: 'Welcome123',
        name: 'City General Hospital',
        location: 'New York, NY',
      };

      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send(hospitalData)
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.email).toBe(hospitalData.email);
      expect(res.body.data.user.name).toBe(hospitalData.name);
    });

    it('should return 400 for duplicate email', async () => {
      const hospitalData = {
        email: 'test@hospital.com',
        password: 'Welcome123',
        name: 'City General Hospital',
        location: 'New York, NY',
      };

      await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send(hospitalData)
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send(hospitalData)
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Sign In', () => {
    it('should login and set session cookie', async () => {
      // First, sign up
      await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          email: 'login@hospital.com',
          password: 'Welcome123',
          name: 'Login Hospital',
          location: 'Boston, MA',
        })
        .expect(201);

      // Then login
      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({
          email: 'login@hospital.com',
          password: 'Welcome123',
        })
        .expect(200);

      // Cookie should be set
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({
          email: 'wrong@hospital.com',
          password: 'Wrong123',
        })
        .expect(400);
    });
  });

  describe('Sign Out', () => {
    it('should logout and clear session', async () => {
      // Login first
      await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({
          email: 'test@hospital.com',
          password: 'Welcome123',
        })
        .expect(200);

      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-out')
        .expect(200);

      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  describe('Session', () => {
    it('should get session and return user info', async () => {
      // Login first
      await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({
          email: 'test@hospital.com',
          password: 'Welcome123',
        })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/api/auth/session')
        .expect(200);

      expect(res.body).toHaveProperty('data');
    });
  });
});