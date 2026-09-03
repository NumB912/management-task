import {
  AppError,
  ICache,
  IHashService,
  ITokenService,
  IUsecase,
  IUserRepository,
} from "@/app/core/domain";

export class ChangePasswordUsecase implements IUsecase<void> {
  private readonly tokenService: ITokenService;
  private readonly cache: ICache;
  private readonly repository: IUserRepository;
  private readonly hashService: IHashService;
  constructor(
    repository: IUserRepository,
    tokenService: ITokenService,
    hashService: IHashService,
    cache: ICache,
  ) {
    this.tokenService = tokenService;
    this.cache = cache;
    this.repository = repository;
    this.hashService = hashService;
  }

  async execute(formChangePassword: {
    email: string;
    password: string;
  }): Promise<void> {
    try {
      const payload = await this.cache.get(
        `changePassword:email:${formChangePassword.email}`,
      );

      if(!payload){
        throw new AppError("RUN_OUT_TIME", "Hết hạn", 400);
      }

      const { token } = payload as { token: string };
      if (!token) {
        throw new AppError("TOKEN_NOT_EXIST", "Token không tồn tại", 400);
      }
      const result = await this.tokenService.verifyToken(token);
      if (!result) {
        throw new AppError("USER_NOT_EXIST", "nguồi dùng không tồn tại", 400);
      }
      const { email } = result as { email: string };
      await this.cache.delete(`changePassword:email:${formChangePassword.email}`);
      await this.cache.delete(`changePassword:token:${token}`);
      const user = await this.repository.findOne({
        email: email,
      });

      if (!user) {
        throw new AppError("USER_NOT_EXIST", "Người dùng không tồn tại", 400);
      }

      const passwordHash = await this.hashService.hash(
        formChangePassword.password,
      );
      await this.repository.update(user?.id, {
        password: passwordHash,
      });
    } catch (error: any) {
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình đổi mật khẩu",
        error.status ?? 500,
      );
    }
  }
}
