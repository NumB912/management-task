import {
  AppError,
  ICache,
  ICredentialsService,
  ITokenService,
  IUsecase,
  IUserRepository,
} from "@/domain";

export class LogoutUseCase implements IUsecase<boolean> {
  private readonly tokenService: ITokenService;
  private readonly cache: ICache;

  constructor(tokenService: ITokenService, cache: ICache) {
    this.tokenService = tokenService;
    this.cache = cache;
  }

  async execute(DTO: {
    token: string;
  }): Promise<boolean> {
    try {
      const { token } = DTO;
      const user = (await this.tokenService.verifyToken(token)) as {
        id: string;
      };
      await this.cache.delete(`refreshToken:${user.id}`);
      await this.cache.delete(`token:${user.id}`);
      return true;
    } catch (error: any) {
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lá»—i trong quÃ¡ trÃ¬nh Ä‘Äƒng nháº­p",
        error.status ?? 500,
      );
    }
  }
}
