import { type } from "./type.event";

export interface IConsumer {
  sub<T>(
    exchangeName: string,
    queueName: string,
    routingKeys: string[],
    callback: (event: T) => Promise<void>,
    type?: type,
  ): Promise<void>;
  close(): Promise<void>;
}