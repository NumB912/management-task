import { LoggerMiddleware } from '@/infrastructure/middleware/logger/logger.middleware.js';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './http/user.controller.js';

@Module({
    controllers:[UserController]
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('user');
  }
}
