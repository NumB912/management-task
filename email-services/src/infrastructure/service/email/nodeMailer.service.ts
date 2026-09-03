import type Email from "@domain/entities/email.entities.js";
import type IEmailService from "@domain/service/email.service.js";
import nodemailer, { type Transporter } from "nodemailer";
import { MailConfig } from "src/config.js";

export default class NodeMailerService implements IEmailService {
  private transporter: Transporter;
  constructor() {
      this.transporter = nodemailer.createTransport({
      host: MailConfig.HOST,
      port: Number(MailConfig.PORT), 
      secure: false,
      ignoreTLS: true,             
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmail(props: Email): Promise<void> {
    await this.transporter.sendMail({
      from: props.info.from,
      to: props.info.to,
      subject: props.info.subject,
      html:props.info.html,
    });
  }
}
