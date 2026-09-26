import type { INotification, IPublisher } from "@/app/core/domain";
import { IRealtimeNotifier } from "@/app/core/domain/message";
import {
  REALTIME_MQ,
  RealtimePushMessage,
} from "@/app/core/domain/message/notification.push";
import { INotificationRepository } from "@/app/core/domain/repositories/INotification.repository";

export class RealtimeNotifier implements IRealtimeNotifier {
  constructor(
    private readonly pub: IPublisher,
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async push<T>(userIds: string[], event: string, data: T): Promise<void> {
    if (userIds.length === 0) return;

    let saved: INotification[];
    try {
      saved = await this.notificationRepository.createMany(
        userIds.map((userId) => ({
          user: userId,
          event,
          data: data as Record<string, unknown>,
          is_read: false,
        })),
      );
    } catch (error) {
      console.error("[RealtimeNotifier] Lỗi lưu notification vào DB:", error);
      throw error;
    }

    try {
      await this.pub.pub(
        REALTIME_MQ.EXCHANGE,
        REALTIME_MQ.ROUTING_KEY,
        "direct",
        saved.map((value)=>{
          return {
            id:value.id,
            user:value.user,
            event:value.event,
            data:value.data,
            is_read:false
          }
        })
      );
    } catch (error) {
      console.error(
        "[RealtimeNotifier] Lỗi publish MQ (notification đã lưu DB, chỉ mất real-time):",
        error,
      );
    }
  }
}
