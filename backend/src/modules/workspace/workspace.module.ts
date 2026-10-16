import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { WorkspaceController } from './http/workspace.controller.js';
import { InboxController } from './http/inbox.controller.js';

@Module({
  controllers: [WorkspaceController, InboxController],
})
export class WorkspaceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware)
      .forRoutes(WorkspaceController, InboxController);
  }
}
