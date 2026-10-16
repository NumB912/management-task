import type IConsumer from "@domain/message/consumer.message.js";
import type { type } from "@domain/type/message/publisher.type.js";
import RabbitMQ from "@infrastructure/message/rabbitMQ.message.js";
import type { Channel, ConsumeMessage } from "amqplib";

const MAX_RETRIES = 3;
const RETRY_HEADER = "x-retry-count";

class Consumer implements IConsumer {
  private channel: Channel | null = null;

  private constructor(channel: Channel) {
    this.channel = channel;
  }

  static async create(): Promise<Consumer> {
    const channel = await RabbitMQ.getInstance().getChannel();
    return new Consumer(channel);
  }

  private async setupQueue(
    exchangeName: string,
    queueName: string,
    routingKeys: string[],
    exchangeType: type,
  ): Promise<Channel> {
    if (!this.channel) throw new Error("[Consumer] Channel chưa khởi tạo");

    await this.channel.assertExchange(exchangeName, exchangeType, { durable: true });
    await this.channel.assertQueue(queueName, { durable: true });
    await this.channel.assertQueue(`${queueName}.dlq`, { durable: true });

    for (const routingKey of routingKeys) {
      await this.channel.bindQueue(queueName, exchangeName, routingKey);
    }
    this.channel.prefetch(1);
    return this.channel;
  }

  /**
   * Retry hoặc chuyển vào DLQ, rồi ack message gốc.
   * Retry or move to the DLQ, then ack the original message.
   * fatal = true: lỗi không thể retry (vd: JSON hỏng) → vào DLQ ngay.
   * fatal = true: unrecoverable (e.g. malformed JSON) → straight to the DLQ.
   */
  private handleFailure(
    msg: ConsumeMessage,
    queueName: string,
    error: unknown,
    fatal = false,
  ): void {
    const channel = this.channel;
    if (!channel) return;

    const headers = msg.properties.headers ?? {};
    const retryCount = Number(headers[RETRY_HEADER] ?? 0);
    const base = { persistent: true, contentType: msg.properties.contentType };

    try {
      if (fatal || retryCount >= MAX_RETRIES) {
        channel.sendToQueue(`${queueName}.dlq`, msg.content, {
          ...base,
          headers: {
            ...headers,
            "x-error": error instanceof Error ? error.message : String(error),
            "x-original-routing-key": msg.fields.routingKey,
            "x-failed-at": new Date().toISOString(),
          },
        });
        console.error(`[Consumer] Chuyển vào ${queueName}.dlq sau ${retryCount} lần retry`, error);
      } else {
        // Gửi thẳng vào queue này (không qua exchange) để các queue khác không nhận trùng
        // Send directly to this queue (not via the exchange) so other bound queues don't get a duplicate
        channel.sendToQueue(queueName, msg.content, {
          ...base,
          headers: { ...headers, [RETRY_HEADER]: retryCount + 1 },
        });
        console.warn(`[Consumer] Retry ${retryCount + 1}/${MAX_RETRIES}`, error);
      }
      channel.ack(msg);
    } catch (publishError) {
      // Không gửi lại/chuyển DLQ được thì requeue để không mất message
      // If we can't republish or dead-letter, requeue so the message isn't lost
      console.error("[Consumer] Không thể retry/DLQ, requeue:", publishError);
      channel.nack(msg, false, true);
    }
  }

  async sub<T>(
    exchangeName: string,
    queueName: string,
    routingKeys: string[],
    exchangeType: type,
    callback: (event: T) => Promise<void>,
  ): Promise<void> {
    const channel = await this.setupQueue(exchangeName, queueName, routingKeys, exchangeType);

    channel.consume(queueName, async (msg) => {
      if (!msg) return;

      let payload: T;
      try {
        payload = JSON.parse(msg.content.toString());
      } catch (error) {
             this.handleFailure(msg, queueName, error, true);
        return;
      }

      try {
        await callback(payload);
        channel.ack(msg);
      } catch (error) {
        this.handleFailure(msg, queueName, error);
      }
    });
  }

  async subBuffer(
    exchangeName: string,
    queueName: string,
    routingKeys: string[],
    exchangeType: type,
    callback: (event: {
      content: Buffer;
      headers: Record<string, unknown>;
      routingKey: string;
    }) => Promise<void>,
  ): Promise<void> {
    const channel = await this.setupQueue(exchangeName, queueName, routingKeys, exchangeType);

    channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        await callback({
          content: msg.content,
          headers: msg.properties.headers ?? {},
          routingKey: msg.fields.routingKey,
        });
        channel.ack(msg);
      } catch (error) {
        this.handleFailure(msg, queueName, error);
      }
    });
  }

  async close(): Promise<void> {
    await this.channel?.close();
    this.channel = null;
  }
}

export default Consumer;