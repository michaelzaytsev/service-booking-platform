import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { registerReqMock } from './auth.mock';

describe('/auth/login (POST)', () => {
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    httpServer = app.getHttpServer();
    prisma = app.get(PrismaService);

    await prisma.user.deleteMany();
    await request(httpServer).post('/auth/register').send(registerReqMock);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Validation errors', () => {
    it('should return 400 if email is missing', async () => {
      const res = await request(httpServer).post('/auth/login').send({ password: registerReqMock.password });
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(httpServer).post('/auth/login').send({ email: registerReqMock.email });
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Authentication failures', () => {
    it('should return 401 if user does not exist', async () => {
      const res = await request(httpServer)
        .post('/auth/login')
        .send({ email: 'notfound@example.com', password: registerReqMock.password });
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return 401 for invalid password', async () => {
      const res = await request(httpServer)
        .post('/auth/login')
        .send({ email: registerReqMock.email, password: 'wrongPassword' });
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Successful login', () => {
    it('should return access and refresh tokens', async () => {
      const res = await request(httpServer)
        .post('/auth/login')
        .send({ email: registerReqMock.email, password: registerReqMock.password });

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should store the new refresh token', async () => {
      await prisma.user.update({ where: { email: registerReqMock.email }, data: { refreshTokenHash: null } });

      const res = await request(httpServer)
        .post('/auth/login')
        .send({ email: registerReqMock.email, password: registerReqMock.password });
      const user = await prisma.user.findUnique({ where: { email: registerReqMock.email } });

      expect(res.status).toBe(HttpStatus.OK);
      expect(user).toHaveProperty('refreshTokenHash');
      expect(typeof user!.refreshTokenHash).toBe('string');
    });
  });
});
