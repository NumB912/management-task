import 'server-only';
export const QueueConfig = {
    RABBITMQ_USER:process.env.RABBITMQ_USER,
    RABBITMQ_PASS:process.env.RABBITMQ_PASS,
    RABBITMQ_HOST:process.env.RABBITMQ_HOST,
    RABBITMQ_PORT:process.env.RABBITMQ_PORT
}
