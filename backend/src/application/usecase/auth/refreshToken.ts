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
        throw new AppError("UNVALID", "KhÃ´ng cÃ³ dá»¯ liá»‡u", 400);
      }

      const { id } = (await this.token.verifyToken(refreshToken)) as {
        id: string;
      };

      if (!id) {
        throw new AppError("UNVALID", "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng", 400);
      }

      const storedToken = await this.cache.get(`refreshToken:${id}`);
      if (!storedToken) {
        throw new AppError("UNVALID", "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng", 400);
      }
      if (storedToken !== refreshToken) {
        throw new AppError("UNVALID", "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng", 400);
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
        error.message ?? "Lá»—i trong quÃ¡ trÃ¬nh refresh token",
        error.status ?? 500,
      );
    }
  }
}


