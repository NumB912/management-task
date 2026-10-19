import { TYPES } from '@/infrastructure/types/dependency.type.js';
import { UserRepository } from '@/infrastructure/repositories/index.js';
import Publisher from '@/infrastructure/event/publisher.event.js';
import { UnitWorkMongo } from '@/infrastructure/repositories/unitWork/mongoUnitWork.repository.js';
import { GetProfileUsecase } from '@/application/usecase/user/getProfile.usecase.js';
import { PutProfileUsecase } from '@/application/usecase/user/profileupdate.usecase.js';
import { PutAvatarUsecase } from '@/application/usecase/user/avatarPut.usecase';
import { DeleteAvatarUsecase } from '@/application/usecase/user/avatarDel.usecase';

export const userProviders = [
  {
    provide: TYPES.GetProfileUsecase,
    inject: [TYPES.UserRepository],
    useFactory: (userRepo: UserRepository) => new GetProfileUsecase(userRepo),
  },
  {
    provide: TYPES.putProfileUsecase,
    inject: [TYPES.UserRepository, TYPES.UnitWork],
    useFactory: (userRepo: UserRepository, unitWork: UnitWorkMongo) =>
      new PutProfileUsecase(userRepo, unitWork),
  },
  {
    provide: TYPES.putAvatarUsecase,
    inject: [TYPES.UserRepository, TYPES.Publisher, TYPES.UnitWork],
    useFactory: (
      userRepo: UserRepository,
      pub: Publisher,
      unitWork: UnitWorkMongo,
    ) => new PutAvatarUsecase(userRepo, pub, unitWork),
  },
  {
    provide: TYPES.deleteAvatarUsecase,
    inject: [TYPES.UserRepository, TYPES.Publisher, TYPES.UnitWork],
    useFactory: (
      userRepo: UserRepository,
      pub: Publisher,
      unitWork: UnitWorkMongo,
    ) => new DeleteAvatarUsecase(userRepo, pub, unitWork),
  },
];
