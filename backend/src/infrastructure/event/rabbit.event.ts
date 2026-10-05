import amqplib, { type Channel, type ChannelModel } from "amqplib";

const globalRabbitInstance = globalThis as typeof globalThis & {
  _instanceRabbit?: RabbitMQ;
};

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30_000;

class RabbitMQ {
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
    this.connection = await amqplib.connect(
      `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}?heartbeat=30`,
    );

    this.connection.on("error", (err: Error) => {
      console.error("[RabbitMQ] Lỗi kết nối:", err.message);
    });

    this.connection.on("close", () => {
      this.channel = null;
      this.connection = null;
      if (this.isClosingIntentionally) {
        this.isClosingIntentionally = false;
        return;
      }
      console.warn("[RabbitMQ] Mất kết nối — sẽ reconnect...");
      this.connecting = this.reconnectWithBackoff()
        .then((channel) => {
          this.channel = channel;
          return channel;
        })
        .finally(() => {
          this.connecting = null;
        });

      this.connecting.catch((err: Error) =>
        console.error("[RabbitMQ] Reconnect thất bại vĩnh viễn:", err.message),
      );
    });

    const channel = await this.connection.createChannel();

    channel.on("error", (err) => {
      console.error("[RabbitMQ] Channel error:", err.message);
      this.channel = null;
    });

    channel.on("close", () => {
      console.warn("[RabbitMQ] Channel đóng");
      this.channel = null;
    });

    console.log("[RabbitMQ] Kết nối thành công");
    return channel;
  }
  private async reconnectWithBackoff(attempt = 1): Promise<Channel> {
    const delay = Math.min(
      BASE_RECONNECT_DELAY_MS * 2 ** (attempt - 1),
      MAX_RECONNECT_DELAY_MS,
    );
    console.warn(`[RabbitMQ] Reconnect lần ${attempt} sau ${delay}ms...`);
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
