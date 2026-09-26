import dotenv from "dotenv";
dotenv.config();

export const RabbitMQConfig = {
    USER:process.env.RABBITMQ_USER,
    PASS:process.env.RABBITMQ_PASS,
    HOST:process.env.RABBITMQ_HOST,
    PORT:process.env.RABBITMQ_PORT
}

export const TOKEN = {
    SECRET_KEY:process.env.SECRET_KEY
}
