import dotenv from "dotenv";
dotenv.config();

export const RabbitMQConfig = {
    URI: process.env.RABBITMQ_URI,
}

export const TOKEN = {
    SECRET_KEY:process.env.SECRET_KEY
}
