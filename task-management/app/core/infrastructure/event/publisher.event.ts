
import type { Channel } from "amqplib";
import { AppError, IPublisher } from "../../domain";
import RabbitMQ from "./rabbit.event";

export default class Publisher implements IPublisher{
  private channel: Channel | null = null;

  private constructor(channel:Channel) {
    this.channel = channel
  }

  static async create():Promise<Publisher>{
    const channel = await RabbitMQ.getInstance().getChannel()
    return new Publisher(channel)
  }

  async pub<T>(
    exchangeName: string,
    routingKey: string="",
    type: "fanout" | "topic" | "direct" = "direct",
    event: T,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("[Publisher] Channel đã đóng");
    }

    this.channel.assertExchange(exchangeName, type, {
      durable: true,
    });

    const ok = this.channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      { persistent: true },
    );

    if (!ok) {
      throw new AppError(
        "broker",
        "[Publisher] Buffer đầy, publish thất bại",
        500,
      );
    }
  }

  async close(): Promise<void> {
    await this.channel?.close();
    this.channel = null;
  }
}