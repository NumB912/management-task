import { CheckAccountStatusMiddleware } from '@/infrastructure/middleware/auth/checkAccountStatus.middleware.js';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { StatisticsRepository } from '@/infrastructure/repositories/statistics.repository.js';
import { StatisticsController } from './statistics.controller.js';
import { DatabaseModule } from '../platform/database.module.js';
import { SecurityModule } from '../security/security.module.js';

@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [StatisticsController],
  providers: [StatisticsRepository],
})
export class StatisticsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware, CheckAccountStatusMiddleware)
      .forRoutes(StatisticsController);
  }
}
