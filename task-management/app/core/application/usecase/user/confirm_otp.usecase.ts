import {
  AppError,
  ICache,
  IOtpService,
  ITokenService,
  IUsecase,
} from "@/app/core/domain";

export class ConfirmOtpUsecase implements IUsecase<string> {
  private readonly otpService: IOtpService;
  private readonly TokenService: ITokenService;
  private readonly RedisService: ICache;
  constructor(
    otpService: IOtpService,
    TokenService: ITokenService,
    RedisService: ICache,
  ) {
    this.otpService = otpService;
    this.TokenService = TokenService;
    this.RedisService = RedisService;
  }

  async execute(email: string, otp: string): Promise<string> {
    try {
      const [token] = await Promise.all([this.TokenService.generateToken({ email: email }, "7m"), this.otpService.verify(email, otp),])
      if (!token) {
        throw new AppError("UNVALID", "Không tìm thấy người dùng", 400);
      }
      await this.RedisService.set(`register:${email}`, token, 60 * 7);
      return token;
    } catch (error) {
      console.error("[ConfirmOtpUsecase] error:", error);
      throw error;
    }
  }
}
