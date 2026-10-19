import { TYPES } from '@/infrastructure/types/dependency.type.js';
import { NotificationRepository } from '@/infrastructure/repositories/notification.repository.js';
import Publisher from '@/infrastructure/event/publisher.event.js';
import { GetNotificationsUsecase } from '@/application/usecase/notifications/getNotification.usecase.js';
import { ReadedNotificationUsecase } from '@/application/usecase/notifications/readNotification.usecase.js';
import { RealtimeNotifier } from '@/application/usecase/notifications/notification.usecase.js';
import { GetNotificationDetailUsecase } from '@/application/usecase/notifications/getDetailNotification.usecase';

export const notificationsProviders = [
  {
    provide: TYPES.getNotification,
    inject: [TYPES.notificationRepository],
    useFactory: (notificationRepo: NotificationRepository) =>
      new GetNotificationsUsecase(notificationRepo),
  },
  {
    provide: TYPES.getNotificationDetail,
    inject: [TYPES.notificationRepository],
    useFactory: (notificationRepo: NotificationRepository) =>
      new GetNotificationDetailUsecase(notificationRepo),
  },
  {
    provide: TYPES.readNotification,
    inject: [TYPES.notificationRepository],
    useFactory: (notificationRepo: NotificationRepository) =>
      new ReadedNotificationUsecase(notificationRepo),
  },
  {
    provide: TYPES.RealTimeNotifier,
    inject: [TYPES.Publisher, TYPES.notificationRepository],
    useFactory: (
      publisher: Publisher,
      notificationRepo: NotificationRepository,
    ) => new RealtimeNotifier(publisher, notificationRepo),
  },
];
