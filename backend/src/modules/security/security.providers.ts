import { TYPES } from '@/infrastructure/types/dependency.type.js';
import {
  MemberRepository,
  ListRepository,
  SectionRepository,
  TagRepository,
  TaskRepository,
} from '@/infrastructure/repositories/index.js';
import { AccountAccessRepository } from '@/infrastructure/repositories/accountAccess.repository.js';
import { CheckAccountAccessUsecase } from '@/application/usecase/auth/checkAccountAccess.usecase.js';
import CredentialsService from '@/infrastructure/services/ICreadentials.service';
import TokenService from '@/infrastructure/services/token.service';
import OTPService from '@/infrastructure/services/otp.service';
import { CheckPermissionListUsecase } from '@/application/usecase/members/checkPermissionList.usecase.js';
import { CheckPermissionSectionUsecase } from '@/application/usecase/members/checkPermissionSection.usecase.js';
import { CheckPermissionTaskUsecase } from '@/application/usecase/members/checkPremissionTask.usecase.js';
import { CheckOwnerUsecase } from '@/application/usecase/middleware/checkOwnerList.usecase.js';
import { CheckOwnerTagUsecase } from '@/application/usecase/middleware/checkOwnerTag.usecase.js';

export const securityProviders = [
  {
    provide: CheckAccountAccessUsecase,
    inject: [AccountAccessRepository],
    useFactory: (repository: AccountAccessRepository) =>
      new CheckAccountAccessUsecase(repository),
  },
  { provide: TYPES.CredentialsService, useClass: CredentialsService },
  { provide: TYPES.TokenService, useClass: TokenService },
  { provide: TYPES.OtpService, useClass: OTPService },
  {
    provide: TYPES.CheckPermissionListUsecase,
    inject: [TYPES.MemberRepository, TYPES.ListRepository],
    useFactory: (memberRepo: MemberRepository, listRepo: ListRepository) =>
      new CheckPermissionListUsecase(memberRepo, listRepo),
  },
  {
    provide: TYPES.CheckPermissionSectionUsecase,
    inject: [TYPES.SectionRepository, TYPES.CheckPermissionListUsecase],
    useFactory: (
      sectionRepo: SectionRepository,
      checkPermissionListUsecase: CheckPermissionListUsecase,
    ) =>
      new CheckPermissionSectionUsecase(
        sectionRepo,
        checkPermissionListUsecase,
      ),
  },
  {
    provide: TYPES.CheckPermissionTaskUsecase,
    inject: [TYPES.TaskRepository, TYPES.CheckPermissionListUsecase],
    useFactory: (
      taskRepo: TaskRepository,
      checkPermissionListUsecase: CheckPermissionListUsecase,
    ) => new CheckPermissionTaskUsecase(taskRepo, checkPermissionListUsecase),
  },
  {
    provide: TYPES.CheckOwnerUsecase,
    inject: [TYPES.ListRepository],
    useFactory: (listRepo: ListRepository) => new CheckOwnerUsecase(listRepo),
  },
  {
    provide: TYPES.CheckOwnerTagUsecase,
    inject: [TYPES.TagRepository],
    useFactory: (tagRepo: TagRepository) => new CheckOwnerTagUsecase(tagRepo),
  },
];
