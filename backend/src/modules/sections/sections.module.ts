import { CheckAccountStatusMiddleware } from '@/infrastructure/middleware/auth/checkAccountStatus.middleware.js';
import { PersistenceModule } from '@/modules/platform/persistence.module.js';
import { MessagingModule } from '@/modules/platform/messaging.module.js';
import { SecurityModule } from '@/modules/security/security.module.js';
import { sectionsProviders } from './sections.providers.js';
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
  imports: [PersistenceModule, MessagingModule, SecurityModule],
  providers: sectionsProviders,
  controllers: [SectionsController, ListSectionsController],
})
export class SectionsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware, CheckAccountStatusMiddleware)
      .forRoutes(SectionsController, ListSectionsController);

    consumer
      .apply(CheckPermissionListMiddleware(EDITOR_PERMISSION))
      .forRoutes(ListSectionsController);

    consumer
      .apply(CheckPermissionSectionMiddleware(EDITOR_PERMISSION))
      .forRoutes(SectionsController);
  }
}
