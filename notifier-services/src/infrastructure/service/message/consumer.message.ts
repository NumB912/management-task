
import type IConsumer from "@domain/message/consumer.message.js";
import type { type } from "@domain/type/message/publisher.type.js";
import RabbitMQ from "@infrastructure/message/rabbitMQ.message.js";
import type { Channel } from "amqplib";

class Consumer implements IConsumer {
  private channel: Channel | null = null;

  private constructor(channel: Channel) {
    this.channel = channel;
  }

  static async create(): Promise<Consumer> {
    const channel = await RabbitMQ.getInstance().getChannel()
    return new Consumer(channel);
  }

  async sub<T>(
    exchangeName: string,
    queueName: string,
    routingKeys: string[],
    exchangeType: type,
    callback: (event: T) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("[Consumer] Channel chưa khởi tạo");
    }

    await this.channel.assertExchange(exchangeName, exchangeType, {
      durable: true,
    });

    await this.channel.assertQueue(queueName, { durable: true });

    for (const routingKey of routingKeys) {
      await this.channel.bindQueue(queueName, exchangeName, routingKey);
    }

    this.channel.prefetch(1);

    this.channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const payload: T = JSON.parse(
          msg.content.toString(),
        );

        await callback(payload);
        this.channel?.ack(msg);
      } catch (error) {
        console.error("[Consumer] Xử lý thất bại:", error);
        this.channel?.nack(msg, false, true);
      }
    });
  }

  async close(): Promise<void> {
    await this.channel?.close();
    this.channel = null;
  }
}

export default Consumer;