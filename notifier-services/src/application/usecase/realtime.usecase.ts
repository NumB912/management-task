import type IConsumer from "@domain/message/consumer.message.js";
import type IUsecase from "@domain/usecase/usecase.entities.js";
import type IRealtimeGateway from "@domain/gateway/realtime.domain.js";
interface MemberInvitedEvent {
  event: string;
  id: string;
  user: string;
  data: any;
  is_read: false;
}

export default class NotifierUsecase implements IUsecase<void> {
  constructor(
    private readonly consumer: IConsumer,
    private readonly realtimeGateway: IRealtimeGateway,
  ) {}
  async execute(): Promise<void> {
    this.consumer.sub<MemberInvitedEvent[]>(
      "realtime.events",
      "realtime.queue",
      ["realtime.push"],
      "direct",
      async (events) => {
        events.forEach((event) => {
          this.realtimeGateway.pushToUser(event.user, event.event, {
            data:event.data,
            id:event.id,
            is_read:event.is_read,
          });
        });
      },
    );
  }
}
