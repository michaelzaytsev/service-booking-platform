import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from '@sbp/run';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = env.API_PORT || 4000;
  await app.listen(port);
}
bootstrap();
