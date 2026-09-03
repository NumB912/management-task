import "dotenv/config";
import Consumer from "@infrastructure/service/message/consumer.message.js";
import NodeMailerService from "@infrastructure/service/email/nodeMailer.service.js";
import SendEmail from "@application/usecase/email.usecase.js";
import SendChangePassConsumer from "@application/event/sendChangePass.event.js";
import SendOtpUsecase from "@application/event/sendOtp.event.js";

async function bootstraping() {
  try {
    const consumer = await Consumer.create();
    console.log("Consumer connected to RabbitMQ successfully");
    const nodeMailService = new NodeMailerService()
    const sendMailUC = new SendEmail(nodeMailService)
    const sendOtp = new SendOtpUsecase(sendMailUC,consumer)
    const sendChangePassEvent = new SendChangePassConsumer(sendMailUC,consumer)
    sendChangePassEvent.execute()
    sendOtp.execute()
  } catch (error) {
    console.error(error);
  }
}

bootstraping();
