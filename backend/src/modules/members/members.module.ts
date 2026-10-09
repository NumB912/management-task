import { LoggerMiddleware } from '@/infrastructure/middleware/logger/logger.middleware.js';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { CheckOwnerMiddleware } from '@/infrastructure/middleware/permission/checkOwner.middleware.js';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MembersController } from './http/members.controller.js';

@Module({
  controllers: [MembersController],
})
export class MembersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, VerifyTokenMiddleware)
      .forRoutes(MembersController);

    // Chỉ owner mới được xoá / đổi quyền thành viên
    consumer
      .apply(CheckOwnerMiddleware)
      .exclude(
        { path: 'lists/:listId/members/exit', method: RequestMethod.DELETE },
        {
          path: 'lists/:listId/members/inviteStatus',
          method: RequestMethod.PATCH,
        },
      )
      .forRoutes(
        { path: 'lists/:listId/members/:email', method: RequestMethod.DELETE },
        { path: 'lists/:listId/members/:email', method: RequestMethod.PATCH },
      );
  }
}
