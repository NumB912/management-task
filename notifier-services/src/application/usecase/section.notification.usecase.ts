import type IConsumer from "@domain/message/consumer.message.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";
import type IRealtimeGateway from "@domain/gateway/realtime.domain.js";
import type { Event } from "./taskNotification.usecase.js";
export class SectionCreateNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
    this.consumer.sub<Event[]>(
      "section.exchange",
      "section-queue-create",
      ["section.create"],
      "direct",
      async (events) => {
        events.forEach((event) => {
          this.realtimeGateway.pushToUser(event.user, event.event, {
            data:event.data,
            id:event.id,
          });
        });
      },
    );
  }
}

export class SectionUpdateNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
    this.consumer.sub<Event[]>(
      "section.exchange",
      "section-queue-update",
      ["section.update"],
      "direct",
      async (event) => {
        event.forEach((event) => {
          this.realtimeGateway.pushToUser(event.user, event.event, {
            data:event.data,
            id:event.id,
          });
        });
      },
    );
  }
}

export class SectionChangePositionNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
    this.consumer.sub<Event[]>(
      "section.exchange",
      "section-queue-change-position",
      ["section.change.position"],
      "direct",
      async (events) => {
        events.forEach((event) => {
          this.realtimeGateway.pushToUser(event.user, event.event, {
            data:event.data,
            id:event.id,
          });
        });
      },
    );
  }
}

export class SectionRemoveNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
    this.consumer.sub<Event[]>(
      "section.exchange",
      "section-queue-delete",
      ["section.delete"],
      "direct",
      async (events) => {
        events.forEach((event) => {
          this.realtimeGateway.pushToUser(event.user, event.event, {
            data:event.data,
            id:event.id,
          });
        });
      },
    );
  }
}