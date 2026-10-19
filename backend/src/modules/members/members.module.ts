import { CheckAccountStatusMiddleware } from '@/infrastructure/middleware/auth/checkAccountStatus.middleware.js';
import { PersistenceModule } from '@/modules/platform/persistence.module.js';
import { MessagingModule } from '@/modules/platform/messaging.module.js';
import { NotificationsModule } from '@/modules/notifications/notifications.module.js';
import { TagsModule } from '@/modules/tags/tags.module.js';
import { SecurityModule } from '@/modules/security/security.module.js';
import { membersProviders } from './members.providers.js';
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
  imports: [
    PersistenceModule,
    MessagingModule,
    NotificationsModule,
    TagsModule,
    SecurityModule,
  ],
  providers: membersProviders,
  controllers: [MembersController],
})
export class MembersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware, CheckAccountStatusMiddleware)
      .forRoutes(MembersController);
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
