
import type IConsumer from "@domain/message/consumer.message.js";
import type { type } from "@domain/type/message/publisher.type.js";
import RabbitMQ from "@infrastructure/message/rabbitMQ.message.js";
import type { ConfirmChannel as Channel } from "amqplib";
import { EmailDeliveryError } from '../email/resend.service.js';

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
    const failedQueue = `${queueName}.failed`;
    await this.channel.assertQueue(failedQueue, { durable: true });

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

        for (let attempt = 0; ; attempt++) {
          try {
            await callback(payload);
            break;
          } catch (error) {
            if (attempt >= 2 || (error instanceof EmailDeliveryError && !error.retryable)) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
          }
        }
        this.channel?.ack(msg);
      } catch (error) {
        console.error(`[Consumer] Delivery failed; moving to ${failedQueue}`);
        // Keep the original payload for manual inspection and replay.
        try {
          const writable = this.channel!.sendToQueue(failedQueue, msg.content, {
            persistent: true,
            contentType: 'application/json',
          });
          if (!writable) await new Promise<void>(resolve => this.channel!.once('drain', resolve));
          await this.channel!.waitForConfirms();
          this.channel?.ack(msg);
        } catch {
          this.channel?.nack(msg, false, true);
        }
      }
    });
  }

  async close(): Promise<void> {
    await this.channel?.close();
    this.channel = null;
  }
}

export default Consumer;
