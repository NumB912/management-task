import { ICache, ITokenService, IUsecase, IUserRepository } from "@/domain";
import { AppError } from "@/domain/errors/appError.errors";

export class RefreshTokenUseCase implements IUsecase<{
  token: string;
}> {
  private readonly cache: ICache;
  private readonly token: ITokenService;
  private readonly userRepository: IUserRepository;
  constructor(
    cache: ICache,
    token: ITokenService,
    userRepository: IUserRepository,
  ) {
    this.cache = cache;
    this.token = token;
    this.userRepository = userRepository;
  }

  async execute(refreshToken: string | undefined): Promise<{
    token: string;
  }> {
    try {
      if (!refreshToken) {
        throw new AppError('UNAUTHORIZED', 'Refresh token không tồn tại', 401);
      }

      const { id } = (await this.token.verifyToken(refreshToken)) as {
        id: string;
      };

      if (!id) {
        throw new AppError('UNAUTHORIZED', 'Refresh token không hợp lệ', 401);
      }

      const storedToken = await this.cache.get(`refreshToken:${id}`);
      if (!storedToken) {
        throw new AppError('UNAUTHORIZED', 'Phiên đăng nhập đã hết hạn', 401);
      }
      if (storedToken !== refreshToken) {
        throw new AppError('UNAUTHORIZED', 'Refresh token không hợp lệ', 401);
      }

      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new AppError('UNAUTHORIZED', 'Tài khoản không còn tồn tại', 401);
      }

      const token = await this.token.generateToken(
        {
          id: id,
          name: user.name,
          role: user.role,
          email:user.email
        },
        "15m",
      );
      return { token: token };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error?.name === 'TokenExpiredError' || error?.name === 'JsonWebTokenError') {
        throw new AppError('UNAUTHORIZED', 'Refresh token không hợp lệ hoặc đã hết hạn', 401);
      }
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình thực thi",
        error.status ?? 500,
      );
    }
  }
}


