import dotenv from "dotenv";
dotenv.config();
export const MailConfig = {
    AUTH:process.env.EMAIL_FROM?.trim() || '',
    RESEND_API_KEY:process.env.RESEND_API_KEY,
}

export const RabbitMQConfig = {
    URI: process.env.RABBITMQ_URI,
}
