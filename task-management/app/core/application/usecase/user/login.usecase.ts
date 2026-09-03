import {
  AppError,
  ICache,
  IHashService,
  ITokenService,
  IUsecase,
  IUserRepository,
} from "@/app/core/domain";




export class LoginWithEmailUseCase implements IUsecase<{
  token: string;
  refresh_token: string;
}> {
  private readonly repository: IUserRepository;
  private readonly hashService: IHashService;
  private readonly tokenService: ITokenService;
  private readonly cache: ICache;
  constructor(
    repository: IUserRepository,
    hashService: IHashService,
    tokenService: ITokenService,
    cache: ICache,
  ) {
    this.repository = repository;
    this.hashService = hashService;
    this.tokenService = tokenService;
    this.cache = cache;
  }

  async execute(
    loginDTO: {
      email: string
      password: string
    }
  ): Promise<{ token: string; refresh_token: string }> {
    try {
      const user = await this.repository.findOne({
        email: loginDTO.email
      });
      if (!user) {
        throw new AppError("UNVALID", "Không tìm thấy người dùng", 400);
      }
      const compare = await this.hashService.compare(loginDTO.password, user.password)
      if (!compare) {
        throw new AppError(
          "UNVALID",
          "Sai tài khoản hoặc mật khẩu vui lòng thử lại",
          400,
        );
      }
      const refreshToken = await this.tokenService.generateToken(
        {
          id: user.id,
          role: user.role
        },
        "1d",
      );
      await this.cache.set(`refreshToken:${user.id}`, refreshToken, 60 * 60 * 24);
      const token = await this.tokenService.generateToken(
        {
          email: loginDTO.email,
          id: user.id,
          role: user.role
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
