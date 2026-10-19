import { CheckAccountStatusMiddleware } from '@/infrastructure/middleware/auth/checkAccountStatus.middleware.js';
import { PersistenceModule } from '@/modules/platform/persistence.module.js';
import { SecurityModule } from '@/modules/security/security.module.js';
import { pomodoroProviders } from './pomodoro.providers.js';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { pomodoroController } from './http/pomodoro.controller.js';

@Module({
  imports: [PersistenceModule, SecurityModule],
  providers: pomodoroProviders,
  controllers: [pomodoroController],
})
export class pomodoroModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware, CheckAccountStatusMiddleware)
      .forRoutes(pomodoroController);
  }
}
