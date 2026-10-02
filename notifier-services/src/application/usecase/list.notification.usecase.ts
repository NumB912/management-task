import type IConsumer from "@domain/message/consumer.message.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";
import type IRealtimeGateway from "@domain/gateway/realtime.domain.js";
import type { EventTask } from "./taskNotification.usecase.js";
interface Event {
  event: string;
  id: string;
  user: string;
  data: any;
  is_read?: boolean;
}

export class listUpdateNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
    this.consumer.sub<EventTask>(
      "list.exchange",
      "list-queue",
      ["list.update"],
      "direct",
      async (event) => {
        event.userIds.map((userId) => {
          this.realtimeGateway.pushToUser(userId, event.event, {
            data:event.data,
          });
        });
      },
    );
  }
}

export class listRemoveNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
    this.consumer.sub<EventTask>(
      "list.exchange",
      "list-queue",
      ["list.delete"],
      "direct",
      async (event) => {
        event.userIds.map((userId) => {
          this.realtimeGateway.pushToUser(userId, event.event, {
            data:event.data,
          });
        });
      },
    );
  }
}