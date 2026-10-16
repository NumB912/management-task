import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { LoggerMiddleware } from '@/infrastructure/middleware/logger/logger.middleware.js';
import { StatisticsRepository } from '@/infrastructure/repositories/statistics.repository.js';
import { StatisticsController } from './statistics.controller.js';

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsRepository],
})
export class StatisticsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, VerifyTokenMiddleware)
      .forRoutes(StatisticsController);
  }
}
