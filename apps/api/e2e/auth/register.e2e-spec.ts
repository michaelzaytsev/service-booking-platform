import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import each from 'jest-each';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { registerReqMock } from './auth.mock';

describe('/auth/register (POST)', () => {
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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('Validation errors', () => {
    each([['email'], ['password'], ['firstName'], ['lastName'], ['countryCode']]).it(
      'should return 400 if %s is missing',
      async (prop: string) => {
        const res = await request(httpServer)
          .post('/auth/register')
          .send({ ...registerReqMock, [prop]: undefined });
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      },
    );

    it('should return 400 if email is invalid', async () => {
      const res = await request(httpServer)
        .post('/auth/register')
        .send({ ...registerReqMock, email: 'invalid' });
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if password is too short', async () => {
      const res = await request(httpServer)
        .post('/auth/register')
        .send({ ...registerReqMock, password: '123' });
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Successful registration', () => {
    it('should create a new user', async () => {
      const res = await request(httpServer).post('/auth/register').send(registerReqMock);
      const user = await prisma.user.findUnique({ where: { email: registerReqMock.email } });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(user).toBeTruthy();
    });

    it('should update user with refresh token', async () => {
      const res = await request(httpServer).post('/auth/register').send(registerReqMock);
      const user = await prisma.user.findUnique({ where: { email: registerReqMock.email } });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(user).toHaveProperty('refreshTokenHash');
      expect(typeof user!.refreshTokenHash).toBe('string');
    });

    it('should return both access and refresh tokens', async () => {
      const res = await request(httpServer).post('/auth/register').send(registerReqMock);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });
  });
});
