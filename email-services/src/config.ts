import dotenv from "dotenv";
dotenv.config();
export const MailConfig = {
    AUTH:process.env.AUTH_GOOGLE_EMAIL||'sups56917@gmail.com',
    PASS:process.env.AUTH_GOOGLE_PASS,
    PORT:process.env.PORT_SMTP,
    HOST:process.env.HOST_SMTP
}

export const RabbitMQConfig = {
    USER:process.env.RABBITMQ_USER,
    PASS:process.env.RABBITMQ_PASS,
    HOST:process.env.RABBITMQ_HOST,
    PORT:process.env.RABBITMQ_PORT
}
