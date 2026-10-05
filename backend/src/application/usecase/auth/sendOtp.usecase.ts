import {
  AppError,
  IOtpService,
  IPublisher,
  ITokenService,
  IUsecase,
  IUserRepository,
} from "@/domain";

export class SendOtpUsecase implements IUsecase<string> {
  constructor(
    private readonly publisher: IPublisher,
    private readonly otpService: IOtpService,
    private readonly repository: IUserRepository,
  ){}

  async execute(email: string): Promise<string> {
    try {
      const user = await this.repository.findOne({
        email: email,
      });
      if (user) {
        throw new AppError("EXIST", "Email ngÆ°á»i dÃ¹ng Ä‘Ã£ tá»“n táº¡i vui lÃ²ng Ä‘Äƒng nháº­p", 400);
      }
      const otp = await this.otpService.generateOtp(email);
        this.publisher.pub<{ email: string; otp: string }>(
          "exchange.email",
          "email.send-otp.auth",
          "direct",
          { email: email, otp: otp },
        );
      return email

    } catch (error) {
      console.error(error)
      throw new AppError("ERROR", "Lá»—i trong quÃ¡ trÃ¬nh thá»±c thi", 500)
    }
  }
}
