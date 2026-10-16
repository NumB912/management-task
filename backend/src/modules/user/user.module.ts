import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './http/user.controller.js';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';

@Module({
    controllers: [UserController],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware)
      .forRoutes('user');
  }
}
