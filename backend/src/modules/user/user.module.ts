import { LoggerMiddleware } from '@/infrastructure/middleware/logger/logger.middleware.js';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './http/user.controller.js';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';

@Module({
    controllers:[UserController]
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware,VerifyTokenMiddleware)
      .forRoutes('user');
  }
}
