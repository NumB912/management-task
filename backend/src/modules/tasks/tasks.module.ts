import { LoggerMiddleware } from '@/infrastructure/middleware/logger/logger.middleware.js';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { CheckPermissionListMiddleware } from '@/infrastructure/middleware/permission/checkPermission.middleware.js';
import { CheckPermissionTaskMiddleware } from '@/infrastructure/middleware/permission/checkPermissionTask.middleware.js';
import type { PermissionMethodMap } from '@/domain/entities/permission.entity';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TasksController } from './http/tasks.controller.js';
import { ListTasksController } from './http/listTasks.controller.js';

const EDITOR_PERMISSION: PermissionMethodMap = {
  'can edit': ['DELETE', 'GET', 'PATCH', 'POST', 'PUT'],
  'read only': ['GET'],
};

@Module({
  controllers: [TasksController, ListTasksController],
})
export class TasksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, VerifyTokenMiddleware)
      .forRoutes(TasksController, ListTasksController);
    consumer
      .apply(CheckPermissionListMiddleware(EDITOR_PERMISSION))
      .forRoutes(ListTasksController);
    consumer
      .apply(CheckPermissionTaskMiddleware(EDITOR_PERMISSION))
      .exclude(
        { path: 'tasks/today', method: RequestMethod.GET },
        { path: 'tasks/upComming', method: RequestMethod.GET },
      )
      .forRoutes(TasksController);
  }
}
