import amqplib, { type Channel, type ChannelModel } from "amqplib";
import { Logger } from '@nestjs/common';
import { QueueConfig } from "@/domain/config/queue.config";

const globalRabbitInstance = globalThis as typeof globalThis & {
  _instanceRabbit?: RabbitMQ;
};

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30_000;

class RabbitMQ {
  private readonly logger = new Logger(RabbitMQ.name);
  private channel: Channel | null = null;
  private connection: ChannelModel | null = null;
  private connecting: Promise<Channel> | null = null;
  private isClosingIntentionally = false;

  private constructor() {}

  public static getInstance(): RabbitMQ {
    globalRabbitInstance._instanceRabbit ??= new RabbitMQ();
    return globalRabbitInstance._instanceRabbit;
  }

  public async getChannel(): Promise<Channel> {
    if (this.channel) return this.channel;
    return this.connect();
  }
  private connect(): Promise<Channel> {
    this.connecting ??= this.createChannel()
      .then((channel) => {
        this.channel = channel;
        return channel;
      })
      .finally(() => {
        this.connecting = null;
      });

    return this.connecting;
  }

  private async createChannel(): Promise<Channel> {
    const uri = QueueConfig.RABBITMQ_URI?.trim();
    if (!uri) {
      throw new Error("[RabbitMQ] Missing RABBITMQ_URI");
    }
    this.connection = await amqplib.connect(
      uri,
    );

    this.connection.on("error", (err: Error) => {
      this.logger.error("Lỗi kết nối", err.stack);
    });

    this.connection.on("close", () => {
      this.channel = null;
      this.connection = null;
      if (this.isClosingIntentionally) {
        this.isClosingIntentionally = false;
        return;
      }
      this.logger.warn("Mất kết nối; bắt đầu reconnect");
      this.connecting = this.reconnectWithBackoff(3)
        .then((channel) => {
          this.channel = channel;
          return channel;
        })
        .finally(() => {
          this.connecting = null;
        });

      this.connecting.catch((err: Error) =>
        this.logger.error("Reconnect thất bại vĩnh viễn", err.stack),
      );
    });

    const channel = await this.connection.createChannel();

    channel.on("error", (err) => {
      this.logger.error("Channel error", err.stack);
      this.channel = null;
    });

    channel.on("close", () => {
      this.logger.warn("Channel đóng");
      this.channel = null;
    });

    this.logger.log("Kết nối thành công");
    return channel;
  }
  private async reconnectWithBackoff(attempt = 1): Promise<Channel> {
    const delay = Math.min(
      BASE_RECONNECT_DELAY_MS * 2 ** (attempt - 1),
      MAX_RECONNECT_DELAY_MS,
    );
    this.logger.warn(`Reconnect lần ${attempt} sau ${delay}ms...`);
    await new Promise((r) => setTimeout(r, delay));

    try {
      return await this.createChannel();
    } catch (err) {
      if (attempt >= MAX_RECONNECT_ATTEMPTS) throw err;
      return this.reconnectWithBackoff(attempt + 1);
    }
  }

  public async close(): Promise<void> {
    this.isClosingIntentionally = true;
    await this.channel?.close();
    await this.connection?.close();
    this.channel = null;
    this.connection = null;
  }
}

export default RabbitMQ;
