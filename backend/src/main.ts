import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin:"http://localhost:3000",
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization'
  })
  app.use(cookieParser())
  app.setGlobalPrefix('/api/v1')
  await app.listen(process.env.PORT ?? 3010);
}
bootstrap();


