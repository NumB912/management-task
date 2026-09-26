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
      async (event) => {
        event.map((data) => {
          this.realtimeGateway.pushToUser(data.user, data.event, {
            data:data.data,
            id:data.id,
            is_read:data.is_read,
          });
        });
      },
    );
  }
}
