import type IConsumer from '@domain/message/consumer.message.js';
import type IRealtimeGateway from '@domain/gateway/realtime.domain.js';
import type IUsecase from '@domain/usecase/usecase.entities.js';

interface SharedTagEvent {
  userIds: string[];
  data: { operation: 'update' | 'delete' };
}

export class SharedTagNotificationUsecase implements IUsecase<void> {
  constructor(private readonly consumer: IConsumer, private readonly gateway: IRealtimeGateway) {}

  async execute(): Promise<void> {
    await this.consumer.sub<SharedTagEvent>(
      'Tag.exchange', 'Tag-queue-with-share', ['Tag.update.withShare', 'Tag.delete.withShare'], 'direct',
      async ({ userIds, data }) => {
        if (data.operation !== 'update' && data.operation !== 'delete') return;
        for (const userId of new Set(userIds)) {
          this.gateway.pushToUser(userId, `tag-${data.operation}-with-share`, { data });
        }
      },
    );
  }
}
