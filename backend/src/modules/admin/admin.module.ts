import { CheckAccountStatusMiddleware } from '@/infrastructure/middleware/auth/checkAccountStatus.middleware.js';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { AdminRepository } from '@/infrastructure/repositories/admin.repository.js';
import { AdminGuard } from '@/infrastructure/guards/admin.guard.js';
import { CheckAdminUsecase } from '@/application/usecase/admin/checkAdmin.usecase.js';
import { GetAdminUsersUsecase } from '@/application/usecase/admin/getAdminUsers.usecase.js';
import { UpdateAdminUserUsecase } from '@/application/usecase/admin/updateAdminUser.usecase.js';
import { GetAdminActivityUsecase } from '@/application/usecase/admin/getAdminActivity.usecase.js';
import type { IAdminRepository } from '@/domain/repositories/IAdmin.repository.js';
import { TYPES } from '@/infrastructure/types/dependency.type.js';
import { AdminController } from './http/admin.controller.js';
import { DatabaseModule } from '../platform/database.module.js';
import { SecurityModule } from '../security/security.module.js';
import { GetAdminUserWorkStatisticsUsecase } from '@/application/usecase/admin/getAdminUserWorkStatistics.usecase.js';

@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [AdminController],
  providers: [
    { provide: TYPES.AdminRepository, useClass: AdminRepository },
    {
      provide: GetAdminUserWorkStatisticsUsecase,
      inject: [TYPES.AdminRepository],
      useFactory: (repository: IAdminRepository) =>
        new GetAdminUserWorkStatisticsUsecase(repository),
    },
    {
      provide: UpdateAdminUserUsecase,
      inject: [TYPES.AdminRepository],
      useFactory: (repository: IAdminRepository) =>
        new UpdateAdminUserUsecase(repository),
    },
    {
      provide: GetAdminActivityUsecase,
      inject: [TYPES.AdminRepository],
      useFactory: (repository: IAdminRepository) =>
        new GetAdminActivityUsecase(repository),
    },
    {
      provide: CheckAdminUsecase,
      inject: [TYPES.AdminRepository],
      useFactory: (repository: IAdminRepository) =>
        new CheckAdminUsecase(repository),
    },
    {
      provide: GetAdminUsersUsecase,
      inject: [TYPES.AdminRepository],
      useFactory: (repository: IAdminRepository) =>
        new GetAdminUsersUsecase(repository),
    },
    AdminGuard,
  ],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware, CheckAccountStatusMiddleware)
      .forRoutes(AdminController);
  }
}
