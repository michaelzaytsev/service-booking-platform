import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import path from 'path';

dotenvExpand.expand(
  dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
  }),
);

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(AppModule, {
    logger: isProd ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.use(helmet());
  app.enableCors();

  const logger = new Logger('Bootstrap');
  const port = process.env.API_PORT || 4000;

  await app.listen(port);
  logger.log(`🚀 API is running on http://localhost:${port}`);

  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, async () => {
      logger.warn(`Received ${signal}. Shutting down gracefully...`);
      await app.close();
      process.exit(0);
    });
  });
}
bootstrap();
