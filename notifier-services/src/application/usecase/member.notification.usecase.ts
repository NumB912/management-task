import type IRealtimeGateway from "@domain/gateway/realtime.domain.js";
import type IConsumer from "@domain/message/consumer.message.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";


export interface EventAcceptMember {
  userIds: string[];
  event: string;
  data: any;
  owner:string,
  ownerEvent:string
}

interface Event{
  userIds: string[];
  event: string;
  data: any;
}

export class AcceptStatusMemberNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
   await this.consumer.sub<EventAcceptMember>(
      "memberExchange",
      "member-queue-status-accept",
      ["accept.member"],
      "direct",
      async (event) => {
        event.userIds.forEach((userId) => {
          this.realtimeGateway.pushToUser(userId, event.event, {
            data:event.data,
          });
        });
      },
    );
  }
}

export class DenyStatusMemberNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
   await this.consumer.sub<Event>(
      "memberExchange",
      "member-queue-status-deny",
      ["deny.member"],
      "direct",
      async (event) => {
        event.userIds.forEach((userId) => {
          this.realtimeGateway.pushToUser(userId, event.event, {
            data:event.data,
          });
        });
      },
    );
  }
}

export class ExitMemberNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
   await this.consumer.sub<EventAcceptMember>(
      "memberExchange",
      "member-queue-exit",
      ["exit.member"],
      "direct",
      async (event) => {
        event.userIds.forEach((userId) => {
          this.realtimeGateway.pushToUser(userId, event.event, {
            data:event.data,
          });
        });
      },
    );
  }
}

export class RemoveMemberNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
   await this.consumer.sub<Event>(
      "memberExchange",
      "member-queue-remove",
      ["remove.member"],
      "direct",
      async (event) => {
        event.userIds.forEach((userId) => {
          this.realtimeGateway.pushToUser(userId, event.event, {
            data:event.data,
          });
        });
      },
    );
  }
}

export class RemoveMemberOwnNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
   await this.consumer.sub<Event>(
      "memberExchange",
      "member-queue-remove-own",
      ["remove.own.member"],
      "direct",
      async (event) => {
        event.userIds.forEach((userId) => {
          this.realtimeGateway.pushToUser(userId, event.event, {
            data:event.data,
          });
        });
      },
    );
  }
}

export class UpdateRoleMemberNotificationUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
   await this.consumer.sub<Event>(
      "memberExchange",
      "member-queue-role",
      ["change.role.member"],
      "direct",
      async (event) => {
        event.userIds.forEach((userId) => {
          this.realtimeGateway.pushToUser(userId, event.event, {
            data:event.data,
          });
        });
      },
    );
  }
}