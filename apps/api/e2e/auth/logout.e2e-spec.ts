import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TokensRes } from '../../src/auth/res/tokens.res';
import { PrismaService } from '../../src/prisma/prisma.service';
import { registerReqMock } from './auth.mock';

describe('/auth/logout (POST)', () => {
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

    await prisma.user.deleteMany();
    await request(httpServer).post('/auth/register').send(registerReqMock);
    loginRes = (
      await request(httpServer)
        .post('/auth/login')
        .send({ email: registerReqMock.email, password: registerReqMock.password })
    ).body;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 if Authorization header is missing', async () => {
    const res = await request(httpServer).post('/auth/logout');
    expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should clear refresh token hash for authorized user', async () => {
    const res = await request(httpServer).post('/auth/logout').set('Authorization', `Bearer ${loginRes.accessToken}`);
    expect(res.statusCode).toBe(HttpStatus.NO_CONTENT);

    const userAfter = await prisma.user.findUnique({ where: { email: registerReqMock.email } });
    expect(userAfter!.refreshTokenHash).toBeNull();
  });
});
