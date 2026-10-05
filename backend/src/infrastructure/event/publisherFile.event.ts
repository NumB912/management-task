import type { Channel } from "amqplib";
import { AppError, IPublisherFile, FileUploadInput } from "../../domain";
import RabbitMQ from "./rabbit.event";

const EXCHANGE_FILE = "exchange.file";
const ROUTING_UPLOAD = "file.upload";
const ROUTING_REMOVE = "file.remove";

export default class PublisherFile implements IPublisherFile {
  private channel: Channel | null = null;

  private constructor(channel: Channel) {
    this.channel = channel;
  }

  static async create(): Promise<PublisherFile> {
    const channel = await RabbitMQ.getInstance().getChannel();
    return new PublisherFile(channel);
  }

  async upload(file: FileUploadInput): Promise<void> {
    await this.pubBuffer(ROUTING_UPLOAD, file.buffer, {
      originalName: file.originalName,
      mimetype: file.mimetype,
    });
  }

  async remove(filename: string): Promise<void> {
    await this.pubBuffer(ROUTING_REMOVE, Buffer.alloc(0), { filename });
  }

  private async pubBuffer(
    routingKey: string,
    content: Buffer,
    headers: Record<string, unknown>,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("[PublisherFile] Channel đã đóng");
    }

    await this.channel.assertExchange(EXCHANGE_FILE, "direct", {
      durable: true,
    });

    const ok = this.channel.publish(EXCHANGE_FILE, routingKey, content, {
      persistent: true,
      headers,
    });

    if (!ok) {
      throw new AppError(
        "broker",
        "[PublisherFile] Buffer đầy, publish thất bại",
        500,
      );
    }
  }

  async close(): Promise<void> {
    await this.channel?.close();
    this.channel = null;
  }
}
