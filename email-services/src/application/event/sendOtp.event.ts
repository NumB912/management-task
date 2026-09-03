import { resetPasswordTemplate } from "@application/template/sendChangePass.template.js";
import { otpTemplate } from "@application/template/sendOpt.template.js";
import type SendEmail from "@application/usecase/email.usecase.js";
import Email from "@domain/entities/email.entities.js";
import type IConsumer from "@domain/message/consumer.message.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";
import { MailConfig } from "src/config.js";

export default class SendOtpUsecase implements IUsecase<void> {
  private mailService: SendEmail;
  private consumer: IConsumer;

  constructor(mailService: SendEmail, consumer: IConsumer) {
    this.consumer = consumer;
    this.mailService = mailService;
  }

  async handle(event: { email: string; otp: string }) {
    console.log(">>> [OTP CONSUMER] Nhận được tin nhắn:");
    this.mailService.execute(
      new Email({
        from: MailConfig.AUTH,
        to: event.email,
        title: "[MÃ OTP] HIỆU LỰC TRONG 15 PHÚT",
        html: otpTemplate({
          userName: event.email,
          otp: event.otp,
          expiresInMinutes: 15,
        }),
      }),
    );
  }

  async execute(): Promise<void> {
    this.consumer.sub<{
      email: string;
      otp: string;
    }>(
      "exchange.email",
      "email-send-otp-queue",
      ["email.send-otp.auth"],
      "direct",
      async (event: { email: string; otp: string }) => {
        await this.handle(event);
      },
    );
  }
}
