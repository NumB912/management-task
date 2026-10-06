import dotenv from "dotenv";
dotenv.config();

export const RabbitMQConfig = {
    USER:process.env.RABBITMQ_USER,
    PASS:process.env.RABBITMQ_PASS,
    HOST:process.env.RABBITMQ_HOST,
    PORT:process.env.RABBITMQ_PORT
}

export const UploadConfig = {
    DIR:process.env.UPLOAD_DIR||"uploads",
    MAX_SIZE_MB:Number(process.env.UPLOAD_MAX_SIZE_MB)||10,
    BASE_URL:process.env.FILE_BASE_URL||""
}

