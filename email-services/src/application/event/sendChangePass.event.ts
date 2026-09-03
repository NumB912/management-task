import { resetPasswordTemplate } from "@application/template/sendChangePass.template.js";
import type SendEmail from "@application/usecase/email.usecase.js";
import Email from "@domain/entities/email.entities.js";
import type IConsumer from "@domain/message/consumer.message.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";
import { MailConfig } from "src/config.js";

export default class SendChangePassConsumer implements IUsecase<void> {
  private mailService: SendEmail;
  private consumer: IConsumer;

  constructor(mailService: SendEmail, consumer: IConsumer) {
    this.consumer = consumer;
    this.mailService = mailService;
  }

  async handle(event: { email: string; token: string }) {
    this.mailService.execute(
      new Email({
        from: MailConfig.AUTH,
        to: event.email,
        title: "[ĐỔI MẬT KHẨU]-VUI LÒNG ĐỌC TRONG 15\'",
        html:resetPasswordTemplate({
          userName: event.email,
          resetLink: event.token,
          expiresInMinutes: 15,
        }),
      }),
    );
  }

  async execute(): Promise<void> {
    this.consumer.sub<{
      email: string;
      token: string;
    }>(
      "Change.Password",
      "send-change-pass-queue",
      ["send.change-pass.password"],
      "direct",
      async (event: { email: string; token: string }) => {
        await this.handle(event);
      },
    );
  }
}
