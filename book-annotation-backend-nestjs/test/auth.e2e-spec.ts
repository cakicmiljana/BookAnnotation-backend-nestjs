import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { User } from '../src/models/user';

// Uses the seeded user (npm run seed) and one temporary user, which is
// permanently deleted at the end so the database is left as it was.
describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let seedPassword: string;
  const temporaryUsername = `e2e_${Date.now()}`;
  const temporaryEmail = `${temporaryUsername}@example.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    seedPassword = process.env.SEED_USER_PASSWORD ?? 'reader123';
  });

  afterAll(async () => {
    await app
      .get(DataSource)
      .getRepository(User)
      .delete({ username: temporaryUsername });
    await app.close();
  });

  function login(body: object) {
    return request(app.getHttpServer()).post('/api/auth/login').send(body);
  }

  async function loginAsMiljana(): Promise<string> {
    const response = await login({
      username: 'miljana',
      password: seedPassword,
    }).expect(200);
    return (response.body as { token: string }).token;
  }

  describe('POST /api/auth/login', () => {
    it('logs in with the username and returns the user and a token', async () => {
      const response = await login({
        username: 'miljana',
        password: seedPassword,
      }).expect(200);

      expect(response.body).toEqual({
        user: {
          id: expect.any(Number) as number,
          username: 'miljana',
          email: 'miljana@example.com',
          createdAt: '2026-01-01T09:00:00.000Z',
        },
        token: expect.any(String) as string,
      });
      expect(JSON.stringify(response.body)).not.toContain('passwordHash');
    });

    it('also accepts the email, in any letter case', async () => {
      await login({
        username: 'Miljana@Example.COM',
        password: seedPassword,
      }).expect(200);
    });

    it('gives the same 401 for a wrong password, an unknown user and a missing field', async () => {
      const attempts = [
        { username: 'miljana', password: 'wrong-password' },
        { username: 'nobody-here', password: seedPassword },
        { username: 'miljana' },
        {},
      ];

      for (const body of attempts) {
        const response = await login(body).expect(401);
        expect((response.body as { message: string }).message).toBe(
          'Invalid username or password',
        );
      }
    });
  });

  describe('protected routes (global JwtAuthGuard)', () => {
    it('GET /api/auth/me returns the user for a valid token', async () => {
      const token = await loginAsMiljana();

      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect((response.body as { username: string }).username).toBe('miljana');
    });

    it('returns 401 "Authentication required" without a token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/me')
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Authentication required',
      );
    });

    it('returns 401 "Authentication required" for a malformed token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/me')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Authentication required',
      );
    });

    it('returns 401 "Your session has expired" for an expired token', async () => {
      const expiredToken = app
        .get(JwtService)
        .sign({ sub: 1, username: 'miljana' }, { expiresIn: -60 });

      const response = await request(app.getHttpServer())
        .get('/api/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Your session has expired',
      );
    });

    it('keeps @Public() routes open without a token', async () => {
      await request(app.getHttpServer()).get('/api').expect(200);
      await request(app.getHttpServer()).get('/api/health').expect(200);
    });
  });

  describe('register and soft delete', () => {
    let temporaryToken: string;

    it('POST /api/auth/register creates a user and logs them in', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: temporaryUsername,
          email: temporaryEmail,
          password: 'temporary123',
        })
        .expect(201);

      const body = response.body as {
        user: { username: string };
        token: string;
      };
      expect(body.user.username).toBe(temporaryUsername);
      temporaryToken = body.token;
    });

    it('returns 409 when the username is already taken', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: temporaryUsername.toUpperCase(),
          email: 'someone-else@example.com',
          password: 'temporary123',
        })
        .expect(409);

      expect((response.body as { message: string }).message).toBe(
        'Username is already taken',
      );
    });

    it('rejects the token and the login of a soft-deleted user', async () => {
      await app
        .get(DataSource)
        .getRepository(User)
        .softDelete({ username: temporaryUsername });

      await request(app.getHttpServer())
        .get('/api/me')
        .set('Authorization', `Bearer ${temporaryToken}`)
        .expect(401);
      await login({
        username: temporaryUsername,
        password: 'temporary123',
      }).expect(401);
    });
  });
});
