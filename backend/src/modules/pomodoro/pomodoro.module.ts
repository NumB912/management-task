import { LoggerMiddleware } from '@/infrastructure/middleware/logger/logger.middleware.js';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { pomodoroController } from './http/pomodoro.controller.js';

@Module({
  controllers: [pomodoroController],
})
export class pomodoroModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, VerifyTokenMiddleware)
      .forRoutes(pomodoroController);
  }
}
