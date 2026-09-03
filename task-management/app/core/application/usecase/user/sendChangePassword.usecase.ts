import { AppError, ICache, IPublisher, ITokenService, IUsecase, IUserRepository } from "@/app/core/domain";

export class SendChangePasswordUsecase implements IUsecase<void> {

  constructor(
    private readonly publisher: IPublisher,
    private readonly tokenService: ITokenService,
    private readonly cache: ICache,
    private readonly userRepository: IUserRepository
  ) {
  }
  async execute(email: string): Promise<void> {
    try {

      const user = await this.userRepository.findOne({
        email: email
      })

      if (!user) {
        return
      }

      const existingToken = (await this.cache.get(
        `changePassword:email:${email}`,
      )) as {
        token: string;
        created_at: Date;
      };


      if (
        existingToken &&
        Date.now() - new Date(existingToken.created_at).getTime() <=
        30 * 1000
      ) {
        throw new AppError("", "WAIT_30_SECONDS", 400);
      }


      if (existingToken) {
        await Promise.all([
          this.cache.delete(`changePassword:email:${email}`),
          this.cache.delete(`changePassword:token:${existingToken.token}`),
        ]);
      }
      const geneToken = await this.tokenService.generateToken({ email }, "15m");

      this.cache.set(
        `changePassword:email:${email}`,
        { token: geneToken, created_at: new Date() },

        15 * 60 * 1000,
      );

      this.cache.set(
        `changePassword:token:${geneToken}`,
        { email: email },
        15 * 60 * 1000,
      );
      console.log("SendChangePasswordUsecase -> execute -> geneToken", geneToken)
      this.publisher.pub<{ token: string; email: string }>(
        "Change.Password",
        "send.change-pass.password",
        "direct",
        { token: geneToken, email: email },
      );
    } catch (error: any) {
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình gửi đổi mật khẩu",
        error.status ?? 500,
      );
    }
  }
}
