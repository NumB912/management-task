import { TYPES } from '@/infrastructure/types/dependency.type.js';
import { UserRepository } from '@/infrastructure/repositories/index.js';
import { RedisCache } from '@/infrastructure/cache/redis.cache.js';
import CredentialsService from '@/infrastructure/services/ICreadentials.service';
import TokenService from '@/infrastructure/services/token.service';
import OTPService from '@/infrastructure/services/otp.service';
import Publisher from '@/infrastructure/event/publisher.event.js';
import { UnitWorkMongo } from '@/infrastructure/repositories/unitWork/mongoUnitWork.repository.js';
import { ChangePasswordUsecase } from '@/application/usecase/auth/changePassword.usecase.js';
import { ConfirmOtpUsecase } from '@/application/usecase/auth/confirm_otp.usecase.js';
import { LoginWithEmailUseCase } from '@/application/usecase/auth/login.usecase.js';
import { LogoutUseCase } from '@/application/usecase/auth/logout.usecase.js';
import { RefreshTokenUseCase } from '@/application/usecase/auth/refreshToken.js';
import { RegisterEmailUsecase } from '@/application/usecase/auth/register.usecase.js';
import { SendChangePasswordUsecase } from '@/application/usecase/auth/sendChangePassword.usecase.js';
import { SendOtpUsecase } from '@/application/usecase/auth/sendOtp.usecase.js';
import { InitListUsecase } from '@/application/usecase/lists/initList.usecase.js';

export const authProviders = [
  {
    provide: TYPES.ChangePasswordUsecase,
    inject: [
      TYPES.UserRepository,
      TYPES.TokenService,
      TYPES.CredentialsService,
      TYPES.Cache,
    ],
    useFactory: (
      userRepo: UserRepository,
      tokenService: TokenService,
      credentialsService: CredentialsService,
      cache: RedisCache,
    ) =>
      new ChangePasswordUsecase(
        userRepo,
        tokenService,
        credentialsService,
        cache,
      ),
  },
  {
    provide: TYPES.ConfirmOtpUsecase,
    inject: [TYPES.OtpService, TYPES.TokenService, TYPES.Cache],
    useFactory: (
      otpService: OTPService,
      tokenService: TokenService,
      cache: RedisCache,
    ) => new ConfirmOtpUsecase(otpService, tokenService, cache),
  },
  {
    provide: TYPES.LoginWithEmailUseCase,
    inject: [
      TYPES.UserRepository,
      TYPES.CredentialsService,
      TYPES.TokenService,
      TYPES.Cache,
    ],
    useFactory: (
      userRepo: UserRepository,
      credentialsService: CredentialsService,
      tokenService: TokenService,
      cache: RedisCache,
    ) =>
      new LoginWithEmailUseCase(
        userRepo,
        credentialsService,
        tokenService,
        cache,
      ),
  },
  {
    provide: TYPES.logoutUsecase,
    inject: [TYPES.TokenService, TYPES.Cache],
    useFactory: (tokenService: TokenService, cache: RedisCache) =>
      new LogoutUseCase(tokenService, cache),
  },
  {
    provide: TYPES.RefreshUsecase,
    inject: [TYPES.Cache, TYPES.TokenService, TYPES.UserRepository],
    useFactory: (
      cache: RedisCache,
      tokenService: TokenService,
      userRepo: UserRepository,
    ) => new RefreshTokenUseCase(cache, tokenService, userRepo),
  },
  {
    provide: TYPES.RegisterEmailUsecase,
    inject: [
      TYPES.UserRepository,
      TYPES.InitListUsecase,
      TYPES.CredentialsService,
      TYPES.UnitWork,
    ],
    useFactory: (
      userRepo: UserRepository,
      initListUsecase: InitListUsecase,
      credentialsService: CredentialsService,
      unitWork: UnitWorkMongo,
    ) =>
      new RegisterEmailUsecase(
        userRepo,
        initListUsecase,
        credentialsService,
        unitWork,
      ),
  },
  {
    provide: TYPES.SendResetPasswordUsecase,
    inject: [
      TYPES.Publisher,
      TYPES.TokenService,
      TYPES.Cache,
      TYPES.UserRepository,
    ],
    useFactory: (
      publisher: Publisher,
      tokenService: TokenService,
      cache: RedisCache,
      userRepo: UserRepository,
    ) =>
      new SendChangePasswordUsecase(publisher, tokenService, cache, userRepo),
  },
  {
    provide: TYPES.SendOtpUsecase,
    inject: [TYPES.Publisher, TYPES.OtpService, TYPES.UserRepository],
    useFactory: (
      publisher: Publisher,
      otpService: OTPService,
      userRepo: UserRepository,
    ) => new SendOtpUsecase(publisher, otpService, userRepo),
  },
];
