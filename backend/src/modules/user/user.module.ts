import { CheckAccountStatusMiddleware } from '@/infrastructure/middleware/auth/checkAccountStatus.middleware.js';
import { PersistenceModule } from '@/modules/platform/persistence.module.js';
import { MessagingModule } from '@/modules/platform/messaging.module.js';
import { SecurityModule } from '@/modules/security/security.module.js';
import { userProviders } from './user.providers.js';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './http/user.controller.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';

@Module({
  imports: [
    PersistenceModule,
    MessagingModule,
    SecurityModule,
    NotificationsModule,
  ],
  providers: userProviders,
  controllers: [UserController],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware, CheckAccountStatusMiddleware)
      .forRoutes('user');
  }
}
