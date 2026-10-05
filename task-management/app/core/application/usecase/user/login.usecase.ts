import {
  AppError,
  ICache,
  ICredentialsService,
  ITokenService,
  IUsecase,
  IUserRepository,
} from "@/app/core/domain";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_SECONDS = 60 * 15; // 15 phút

export class LoginWithEmailUseCase implements IUsecase<{
  token: string;
  refresh_token: string;
}> {
  private readonly repository: IUserRepository;
  private readonly CredentialsService: ICredentialsService;
  private readonly tokenService: ITokenService;
  private readonly cache: ICache;

  constructor(
    repository: IUserRepository,
    CredentialsService: ICredentialsService,
    tokenService: ITokenService,
    cache: ICache,
  ) {
    this.repository = repository;
    this.CredentialsService = CredentialsService;
    this.tokenService = tokenService;
    this.cache = cache;
  }

  private getAttemptKey(email: string): string {
    return `loginAttempts:${email.trim().toLowerCase()}`;
  }

  private async getAttempts(key: string): Promise<number> {
    const value = await this.cache.get(key);
    return value ? Number(value) || 0 : 0;
  }

  private async increaseAttempts(key: string, current: number): Promise<void> {
    await this.cache.set(key, String(current + 1), LOCK_TIME_SECONDS);
  }

  async execute(loginDTO: {
    email: string;
    password: string;
  }): Promise<{ token: string; refresh_token: string }> {
    try {
      const attemptKey = this.getAttemptKey(loginDTO.email);
      const attempts = await this.getAttempts(attemptKey);
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        throw new AppError(
          "TOO_MANY_REQUESTS",
          "Bạn đã thử đăng nhập quá nhiều lần, vui lòng thử lại sau 15 phút",
          429,
        );
      }

      const user = await this.repository.findOne({
        email: loginDTO.email,
      });
      if (!user) {
        await this.increaseAttempts(attemptKey, attempts);
        throw new AppError(
          "UNVALID",
          "Sai tài khoản hoặc mật khẩu vui lòng thử lại",
          400,
        );
      }
      const compare = await this.CredentialsService.compare(
        loginDTO.password,
        user.password,
      );
      if (!compare) {
        await this.increaseAttempts(attemptKey, attempts);
        const remaining = MAX_LOGIN_ATTEMPTS - (attempts + 1);
        throw new AppError(
          "UNVALID",
          remaining > 0
            ? `Sai tài khoản hoặc mật khẩu, bạn còn ${remaining} lần thử`
            : "Bạn đã thử đăng nhập quá nhiều lần, vui lòng thử lại sau 15 phút",
          remaining > 0 ? 400 : 429,
        );
      }

      await this.cache.delete(attemptKey);

      const refreshToken = await this.tokenService.generateToken(
        {
          id: user.id,
          role: user.role,
        },
        "1d",
      );
      await this.cache.set(
        `refreshToken:${user.id}`,
        refreshToken,
        60 * 60 * 24,
      );
      const token = await this.tokenService.generateToken(
        {
          email: loginDTO.email,
          id: user.id,
          role: user.role,
        },
        "1h",
      );

      return {
        token: token,
        refresh_token: refreshToken,
      };
    } catch (error: any) {
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình đăng nhập",
        error.status ?? 500,
      );
    }
  }
}