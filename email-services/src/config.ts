import dotenv from "dotenv";
dotenv.config();
export const MailConfig = {
    AUTH:process.env.EMAIL_FROM || process.env.AUTH_GOOGLE_EMAIL || '',
    PROVIDER:process.env.EMAIL_PROVIDER || 'smtp',
    RESEND_API_KEY:process.env.RESEND_API_KEY,
    PASS:process.env.AUTH_GOOGLE_PASS,
    PORT:process.env.PORT_SMTP,
    HOST:process.env.HOST_SMTP
}

export const RabbitMQConfig = {
    URI: process.env.RABBITMQ_URI,
}
