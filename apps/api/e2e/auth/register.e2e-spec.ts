import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import each from 'jest-each';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { RegisterReq } from '../../src/auth/req';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('/auth/register (POST)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  const registerReqMock: RegisterReq = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (509) 123-4567',
    countryCode: 'US',
  };

  describe('Validation errors', () => {
    each([['email'], ['password'], ['firstName'], ['lastName'], ['countryCode']]).it(
      'should return error if %s is missing',
      async (prop: string) => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send({ ...registerReqMock, [prop]: undefined });

        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      },
    );

    it('should return error if email is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerReqMock, email: 'invalid' });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return error if password is too short', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerReqMock, password: '123' });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Successful registration', () => {
    it('should create a new user', async () => {
      const res = await request(app.getHttpServer()).post('/auth/register').send(registerReqMock);
      const user = await prisma.user.findUnique({ where: { email: registerReqMock.email } });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(user).toBeTruthy();
    });

    it('should update user with refresh token', async () => {
      const res = await request(app.getHttpServer()).post('/auth/register').send(registerReqMock);
      const user = await prisma.user.findUnique({ where: { email: registerReqMock.email } });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(user).toHaveProperty('refreshTokenHash');
      expect(typeof user!.refreshTokenHash).toBe('string');
    });

    it('should return both access and refresh tokens', async () => {
      const res = await request(app.getHttpServer()).post('/auth/register').send(registerReqMock);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });
  });
});
