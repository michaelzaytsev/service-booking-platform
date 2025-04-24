import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TokensRes } from '../../src/auth/res/tokens.res';
import { PrismaService } from '../../src/prisma/prisma.service';
import { registerReqMock } from './auth.mock';

describe('/auth/refresh (POST)', () => {
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;
  let loginRes: TokensRes;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    httpServer = app.getHttpServer();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await request(httpServer).post('/auth/register').send(registerReqMock);
    loginRes = (
      await request(httpServer)
        .post('/auth/login')
        .send({ email: registerReqMock.email, password: registerReqMock.password })
    ).body;
  });

  const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

  describe('Invalid scenarios', () => {
    it('should return 400 if refreshToken is missing', async () => {
      const res = await request(httpServer).post('/auth/refresh').set(authHeader(loginRes.accessToken)).send();
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 if Authorization header is missing', async () => {
      const res = await request(httpServer).post('/auth/refresh').send({ refreshToken: loginRes.refreshToken });
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 if user is not found', async () => {
      await prisma.user.delete({ where: { email: registerReqMock.email } });
      const res = await request(httpServer)
        .post('/auth/refresh')
        .set(authHeader(loginRes.accessToken))
        .send({ refreshToken: loginRes.refreshToken });
      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should return 403 if user has no stored refresh token', async () => {
      await prisma.user.update({ where: { email: registerReqMock.email }, data: { refreshTokenHash: null } });
      const res = await request(httpServer)
        .post('/auth/refresh')
        .set(authHeader(loginRes.accessToken))
        .send({ refreshToken: loginRes.refreshToken });
      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should return 403 if refresh token does not match stored one', async () => {
      const res = await request(httpServer)
        .post('/auth/refresh')
        .set(authHeader(loginRes.accessToken))
        .send({ refreshToken: 'invalid-token' });
      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });
  });

  describe('Successful refresh', () => {
    it('should return new access and refresh tokens', async () => {
      const res = await request(httpServer)
        .post('/auth/refresh')
        .set(authHeader(loginRes.accessToken))
        .send({ refreshToken: loginRes.refreshToken });

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.accessToken).not.toBe(loginRes.accessToken);
      expect(res.body.refreshToken).not.toBe(loginRes.refreshToken);
    });

    it('should store the new refresh token', async () => {
      const userBefore = await prisma.user.findUnique({ where: { email: registerReqMock.email } });

      const res = await request(httpServer)
        .post('/auth/refresh')
        .send({ email: registerReqMock.email, password: registerReqMock.password });
      const userAfter = await prisma.user.findUnique({ where: { email: registerReqMock.email } });

      expect(res.status).toBe(HttpStatus.OK);
      expect(userAfter!.refreshTokenHash).not.toBe(userBefore!.refreshTokenHash);
    });
  });
});
