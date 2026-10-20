import "./config-env.js";

export const RabbitMQConfig = {
    URI: process.env.RABBITMQ_URI,
}

export const TOKEN = {
    SECRET_KEY:process.env.SECRET_KEY
}
