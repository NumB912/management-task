import { LoggerMiddleware } from '@/infrastructure/middleware/logger/logger.middleware.js';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { ListsController } from './http/lists.controller.js';
import { CheckOwnerMiddleware } from '@/infrastructure/middleware/permission/checkOwner.middleware';
import { CheckPermissionListMiddleware } from '@/infrastructure/middleware/permission/checkPermission.middleware.js';

@Module({
  controllers: [ListsController],
})
export class ListsModule {
  configure(consumer: MiddlewareConsumer) {
    console.log('[ListsModule] configure chạy');
    consumer
      .apply(LoggerMiddleware, VerifyTokenMiddleware)
      .forRoutes('lists');

    consumer
      .apply(
        CheckPermissionListMiddleware({
          'can edit': ['GET'],
          'read only': ['GET'],
        }),
      )
      .forRoutes({ path: 'lists/:listId', method: RequestMethod.GET });

    consumer
      .apply(
        CheckPermissionListMiddleware({
          owner: ['PUT'],
          'can edit': ['PUT'],
        }),
      )
      .forRoutes({ path: 'lists/:listId', method: RequestMethod.PUT });

    consumer
      .apply(
        CheckPermissionListMiddleware({
          owner: ['DELETE'],
        }),
      )
      .forRoutes({ path: 'lists/:listId', method: RequestMethod.DELETE });

    consumer
      .apply(
        CheckPermissionListMiddleware({
          'owner': ['PATCH'],
        }),
      )
      .forRoutes({ path: 'lists/:listId', method: RequestMethod.PATCH });

    consumer
      .apply(
        CheckPermissionListMiddleware({
          'owner': ['PATCH'],
        }),
      )
      .forRoutes({
        path: 'lists/:listId/sortSection',
        method: RequestMethod.PATCH,
      });

    consumer
      .apply(CheckOwnerMiddleware)
      .forRoutes({
        path: 'lists/:listId/members/:email',
        method: RequestMethod.ALL,
      });
  }
}
