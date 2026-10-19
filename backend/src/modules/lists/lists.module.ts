import { CheckAccountStatusMiddleware } from '@/infrastructure/middleware/auth/checkAccountStatus.middleware.js';
import { TYPES } from '@/infrastructure/types/dependency.type.js';
import { PersistenceModule } from '@/modules/platform/persistence.module.js';
import { NotificationsModule } from '@/modules/notifications/notifications.module.js';
import { MessagingModule } from '@/modules/platform/messaging.module.js';
import { SecurityModule } from '@/modules/security/security.module.js';
import { listsProviders } from './lists.providers.js';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { ListsController } from './http/lists.controller.js';
import { CheckPermissionListMiddleware } from '@/infrastructure/middleware/permission/checkPermission.middleware.js';

@Module({
  imports: [
    PersistenceModule,
    NotificationsModule,
    MessagingModule,
    SecurityModule,
  ],
  providers: listsProviders,
  exports: [TYPES.InitListUsecase, TYPES.GetInboxUsecase],
  controllers: [ListsController],
})
export class ListsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware, CheckAccountStatusMiddleware)
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
          owner: ['PATCH'],
        }),
      )
      .forRoutes({ path: 'lists/:listId', method: RequestMethod.PATCH });

    consumer
      .apply(
        CheckPermissionListMiddleware({
          owner: ['PATCH'],
          'can edit': ['PATCH'],
        }),
      )
      .forRoutes({
        path: 'lists/:listId/sortSection',
        method: RequestMethod.PATCH,
      });
  }
}
