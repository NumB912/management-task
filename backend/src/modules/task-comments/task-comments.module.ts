import { MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { TaskCommentsUsecase } from '@/application/usecase/task-comments/taskComments.usecase.js';
import { TaskCommentRepository } from '@/infrastructure/repositories/taskComment.repository.js';
import type { ITaskCommentRepository } from '@/domain/repositories/ITaskComment.repository.js';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { CheckAccountStatusMiddleware } from '@/infrastructure/middleware/auth/checkAccountStatus.middleware.js';
import { DatabaseModule } from '../platform/database.module.js';
import { SecurityModule } from '../security/security.module.js';
import { TaskCommentsController } from './task-comments.controller.js';

@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [TaskCommentsController],
  providers: [
    TaskCommentRepository,
    {
      provide: TaskCommentsUsecase,
      inject: [TaskCommentRepository],
      useFactory: (repository: ITaskCommentRepository) =>
        new TaskCommentsUsecase(repository),
    },
  ],
})
export class TaskCommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware, CheckAccountStatusMiddleware)
      .forRoutes(TaskCommentsController);
  }
}
