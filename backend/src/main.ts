import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = (process.env.APP_URL ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  console.log(allowedOrigins)
  app.enableCsrfProtection({ trustedOrigins: allowedOrigins });
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization'
  })
  app.use(cookieParser())
  app.setGlobalPrefix('/api/v1')
  await app.listen(process.env.PORT ?? 3010);
}
bootstrap();


