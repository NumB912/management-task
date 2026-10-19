import { CheckAccountStatusMiddleware } from '@/infrastructure/middleware/auth/checkAccountStatus.middleware.js';
import { PersistenceModule } from '@/modules/platform/persistence.module.js';
import { SecurityModule } from '@/modules/security/security.module.js';
import { workspaceProviders } from './workspace.providers.js';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { WorkspaceController } from './http/workspace.controller.js';
import { InboxController } from './http/inbox.controller.js';
import { ListsModule } from '../lists/lists.module.js';

@Module({
  imports: [PersistenceModule, SecurityModule, ListsModule],
  providers: workspaceProviders,
  controllers: [WorkspaceController, InboxController],
})
export class WorkspaceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware, CheckAccountStatusMiddleware)
      .forRoutes(WorkspaceController, InboxController);
  }
}
