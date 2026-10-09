import { LoggerMiddleware } from '@/infrastructure/middleware/logger/logger.middleware.js';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { CheckPermissionListMiddleware } from '@/infrastructure/middleware/permission/checkPermission.middleware.js';
import { CheckPermissionSectionMiddleware } from '@/infrastructure/middleware/permission/checkPermissionSection.middleware.js';
import type { PermissionMethodMap } from '@/domain/entities/permission.entity';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SectionsController } from './http/sections.controller.js';
import { ListSectionsController } from './http/listSections.controller.js';

const EDITOR_PERMISSION: PermissionMethodMap = {
  'can edit': ['DELETE', 'GET', 'PATCH', 'POST', 'PUT'],
  'read only': ['GET'],
};

@Module({
  controllers: [SectionsController, ListSectionsController],
})
export class SectionsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, VerifyTokenMiddleware)
      .forRoutes(SectionsController, ListSectionsController);

    consumer
      .apply(CheckPermissionListMiddleware(EDITOR_PERMISSION))
      .forRoutes(ListSectionsController);

    consumer
      .apply(CheckPermissionSectionMiddleware(EDITOR_PERMISSION))
      .forRoutes(SectionsController);
  }
}
