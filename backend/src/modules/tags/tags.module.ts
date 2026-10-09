import { LoggerMiddleware } from '@/infrastructure/middleware/logger/logger.middleware.js';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { CheckOwnerTagMiddleware } from '@/infrastructure/middleware/permission/checkOwnerTag.middleware.js';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TagsController } from './http/tags.controller.js';

@Module({
  controllers: [TagsController],
})
export class TagsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, VerifyTokenMiddleware)
      .forRoutes(TagsController);

    consumer
      .apply(CheckOwnerTagMiddleware)
      .forRoutes(
        { path: 'tags/:tagId/onlyMe', method: RequestMethod.PUT },
        { path: 'tags/:tagId/onlyMe', method: RequestMethod.DELETE },
      );
  }
}
