import "./config-env.js";
import Consumer from "@infrastructure/service/message/consumer.message.js";
import { createEmailService } from "@infrastructure/service/email/email.factory.js";
import SendEmail from "@application/usecase/email.usecase.js";
import SendChangePassConsumer from "@application/event/sendChangePass.event.js";
import SendOtpUsecase from "@application/event/sendOtp.event.js";
import SendMailInviteConsumer from "@application/event/sendInviteMember.event.js";
async function bootstraping() {
  try {
    const emailService = createEmailService();
    const consumer = await Consumer.create();
    console.log("Consumer connected to RabbitMQ successfully");
    const sendMailUC = new SendEmail(emailService)
    const sendOtp = new SendOtpUsecase(sendMailUC,consumer)
    const sendChangePassEvent = new SendChangePassConsumer(sendMailUC,consumer)
    const sendInviteInvite = new SendMailInviteConsumer(sendMailUC,consumer)
    await sendChangePassEvent.execute()
    await sendOtp.execute()
    await sendInviteInvite.execute()
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

bootstraping();
