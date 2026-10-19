import { CheckAccountStatusMiddleware } from '@/infrastructure/middleware/auth/checkAccountStatus.middleware.js';
import { PersistenceModule } from '@/modules/platform/persistence.module.js';
import { CoreServicesModule } from '@/modules/platform/core-services.module.js';
import { SecurityModule } from '@/modules/security/security.module.js';
import { filtersProviders } from './filters.providers.js';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FiltersController } from './http/filters.controller.js';

@Module({
  imports: [PersistenceModule, CoreServicesModule, SecurityModule],
  providers: filtersProviders,
  controllers: [FiltersController],
})
export class FiltersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware, CheckAccountStatusMiddleware)
      .forRoutes(FiltersController);
  }
}
