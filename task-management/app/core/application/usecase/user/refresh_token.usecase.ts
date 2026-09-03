import {
  AppError,
  ICache,
  ITokenService,
  IUsecase,
  IUserRepository,
} from "@/app/core/domain";
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
        throw new AppError("UNVALID", "Không có dữ liệu", 400);
      }

      const { id } = (await this.token.verifyToken(refreshToken)) as {
        id: string;
      };

      if (!id) {
        throw new AppError("UNVALID", "Không tìm thấy người dùng", 400);
      }

      const storedToken = await this.cache.get(`refreshToken:${id}`);
      if (!storedToken) {
        throw new AppError("UNVALID", "Không tìm thấy người dùng", 400);
      }
      if (storedToken !== refreshToken) {
        throw new AppError("UNVALID", "Không tìm thấy người dùng", 400);
      }

      const user = await this.userRepository.findById(id);

      const token = await this.token.generateToken(
        {
          id: id,
          name: user?.name,
          role: user?.role
        },
        "15m",
      );
      return { token: token };
    } catch (error: any) {
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình refresh token",
        error.status ?? 500,
      );
    }
  }
}


