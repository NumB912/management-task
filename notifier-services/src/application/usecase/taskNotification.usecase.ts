import type IConsumer from "@domain/message/consumer.message.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";
import type IRealtimeGateway from "@domain/gateway/realtime.domain.js";
export interface Event {
  event: string;
  id: string;
  user: string;
  data: any;
}

export interface EventTask {
  userIds: string[];
  event: string;
  data: any;
}

export class TaskCreateNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
    this.consumer.sub<EventTask>(
      "Task.exchange",
      "Task-queue-create",
      ["Task.create"],
      "direct",
      async (event) => {
        event.userIds.forEach((userId) => {
          this.realtimeGateway.pushToUser(userId, event.event, {
            data: event.data,
          });
        });
      },
    );
  }
}

export class TaskUpdateStatusNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
    this.consumer.sub<EventTask>(
      "Task.exchange",
      "Task-queue-update-status",
      ["Task.update.status"],
      "direct",
      async (event) => {
        event.userIds.forEach((userId) => {
          this.realtimeGateway.pushToUser(userId, event.event, {
            data: event.data,
          });
        });
      },
    );
  }
}

export class TaskUpdateNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
    this.consumer.sub<EventTask>(
      "Task.exchange",
      "Task-queue-update",
      ["Task.update"],
      "direct",
      async (event) => {
        event.userIds.forEach((userId) => {
          this.realtimeGateway.pushToUser(userId, event.event, {
            data: event.data,
          });
        });
      },
    );
  }
}

// export class TaskChangePositionNotificationUsecase implements IUsecase<void> {
//   constructor(
//     private readonly consumer: IConsumer,
//     private readonly realtimeGateway: IRealtimeGateway,
//   ) {}
//   async execute(): Promise<void> {
//     this.consumer.sub<Event[]>(
//       "Task.exchange",
//       "Task-queue-change",
//       ["Task.change.position"],
//       "direct",
//       async (event) => {
//         event.map((data) => {
//           this.realtimeGateway.pushToUser(data.user, data.event, {
//             data: data.data,
//             id: data.id,
//           });
//         });
//       },
//     );
//   }
// }

export class TaskRemoveNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
    this.consumer.sub<Event[]>(
      "Task.exchange",
      "Task-queue-delete",
      ["Task.delete"],
      "direct",
      async (events) => {
        events.forEach((event) => {
          this.realtimeGateway.pushToUser(event.user, event.event, {
            data: event.data,
            id: event.id,
          });
        });
      },
    );
  }
}
