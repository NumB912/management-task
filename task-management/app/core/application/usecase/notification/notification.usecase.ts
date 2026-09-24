import type { IPublisher } from "@/app/core/domain";
import { IRealtimeNotifier } from "@/app/core/domain/message";
import {
  REALTIME_MQ,
  RealtimePushMessage,
} from "@/app/core/domain/message/notification.push";

export class RealtimeNotifier implements IRealtimeNotifier {
  constructor(private readonly pub: IPublisher) {}
  async push<T>(userIds: string[], event: string, data: T): Promise<void> {
    if (userIds.length === 0) return;
    await this.pub.pub(
      REALTIME_MQ.EXCHANGE,
      REALTIME_MQ.ROUTING_KEY,
      "direct",
      {
        userIds,
        event,
        data,
      } satisfies RealtimePushMessage<T>,
    );
  }
}
