import { resetPasswordTemplate } from "@application/template/sendChangePass.template.js";
import { inviteTemplate } from "@application/template/sendInvite.template.js";
import type SendEmail from "@application/usecase/email.usecase.js";
import Email from "@domain/entities/email.entities.js";
import type IConsumer from "@domain/message/consumer.message.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";
import { MailConfig } from "src/config.js";
export interface InviteTemplateParams {
  email:string,
  name: string;          // tên người được mời
  ownerName: string;     // tên chủ list
  listName: string;
  inviteLink: string;    // link chấp nhận lời mời
  expiresInDays?: number; // hiển thị hạn của lời mời (tùy chọn)
}
export default class SendMailInviteConsumer implements IUsecase<void> {
  private mailService: SendEmail;
  private consumer: IConsumer;

  constructor(mailService: SendEmail, consumer: IConsumer) {
    this.consumer = consumer;
    this.mailService = mailService;
  }

  async handle(event: InviteTemplateParams) {
    console.log(event)
    this.mailService.execute(
      new Email({
        from: MailConfig.AUTH,
        to: event.email,
        title: "[THAM GIA NHÓM]-Lời mời tham gia nhóm",
        html: inviteTemplate({
          name: event.name,
          ownerName: event.ownerName,
          listName: event.listName,
          inviteLink: event.inviteLink,
          expiresInDays: 7,
        }),
      }),
    );
  }

  async execute(): Promise<void> {
    this.consumer.sub<InviteTemplateParams>(
      "exchange.invite.member",
      "queue.invite.member",
      ["member.invite"],
      "direct",
      async (event: {
        email: string;
        name: string;
        ownerName: string;
        listName: string;
        inviteLink: string;
      }) => {
        await this.handle(event);
      },
    );
  }
}
