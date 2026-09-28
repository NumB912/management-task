import type IConsumer from "@domain/message/consumer.message.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";
import type IRealtimeGateway from "@domain/gateway/realtime.domain.js";
interface Event {
  event: string;
  id: string;
  user: string;
  data: any;
  is_read?: boolean;
}

export class ListCreateNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
    this.consumer.sub<Event[]>(
      "List.exchange",
      "List-queue",
      ["List.create"],
      "direct",
      async (event) => {
        event.map((data) => {
          this.realtimeGateway.pushToUser(data.user, data.event, {
            data:data.data,
            id:data.id,
          });
        });
      },
    );
  }
}

export class ListUpdateNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
    this.consumer.sub<Event[]>(
      "List.exchange",
      "List-queue",
      ["List.update"],
      "direct",
      async (event) => {
        event.map((data) => {
          this.realtimeGateway.pushToUser(data.user, data.event, {
            data:data.data,
            id:data.id,
          });
        });
      },
    );
  }
}

export class ListRemoveNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
    this.consumer.sub<Event[]>(
      "List.exchange",
      "List-queue",
      ["List.delete"],
      "direct",
      async (event) => {
        event.map((data) => {
          this.realtimeGateway.pushToUser(data.user, data.event, {
            data:data.data,
            id:data.id,
          });
        });
      },
    );
  }
}