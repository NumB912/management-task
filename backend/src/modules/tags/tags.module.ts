import { CheckAccountStatusMiddleware } from '@/infrastructure/middleware/auth/checkAccountStatus.middleware.js';
import { TYPES } from '@/infrastructure/types/dependency.type.js';
import { PersistenceModule } from '@/modules/platform/persistence.module.js';
import { SecurityModule } from '@/modules/security/security.module.js';
import { tagsProviders } from './tags.providers.js';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { CheckOwnerTagMiddleware } from '@/infrastructure/middleware/permission/checkOwnerTag.middleware.js';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TagsController } from './http/tags.controller.js';

@Module({
  imports: [PersistenceModule, SecurityModule],
  providers: tagsProviders,
  exports: [TYPES.AddTagsForMemberUsecase, TYPES.SynsMemberTagUsecase],
  controllers: [TagsController],
})
export class TagsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware, CheckAccountStatusMiddleware)
      .forRoutes(TagsController);

    consumer
      .apply(CheckOwnerTagMiddleware)
      .forRoutes(
        { path: 'tags/:tagId/onlyMe', method: RequestMethod.PUT },
        { path: 'tags/:tagId/onlyMe', method: RequestMethod.DELETE },
      );
  }
}
