import {
  AppError,
  IOtpService,
  IPublisher,
  ITokenService,
  IUsecase,
  IUserRepository,
} from "@/app/core/domain";

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
        throw new AppError("EXIST", "Email người dùng đã tồn tại vui lòng đăng nhập", 400);
      }
      const otp = await this.otpService.generateOtp(email);
        this.publisher.pub<{ email: string; otp: string }>(
          "exchange.email",
          "email.send-otp.auth",
          "direct",
          { email: email, otp: otp },
        );
        console.log(otp)
      return email

    } catch (error) {
      console.error(error)
      throw new AppError("ERROR", "Lỗi trong quá trình thực thi", 500)
    }
  }
}
