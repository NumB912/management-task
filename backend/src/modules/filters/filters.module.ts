import { LoggerMiddleware } from '@/infrastructure/middleware/logger/logger.middleware.js';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FiltersController } from './http/filters.controller.js';

@Module({
  controllers: [FiltersController],
})
export class FiltersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, VerifyTokenMiddleware)
      .forRoutes(FiltersController);
  }
}
