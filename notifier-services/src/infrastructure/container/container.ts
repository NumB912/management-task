import NotifiterUsecase from "@application/usecase/realtime.usecase.js";
import {
  SectionChangePositionNotificationUsecase,
  SectionCreateNotificationUsecase,
  SectionRemoveNotificationUsecase,
  SectionUpdateNotificationUsecase,
} from "@application/usecase/section.notification.usecase.js";
import {
  TaskCreateNotificationUsecase,
  TaskRemoveNotificationUsecase,
  TaskUpdateNotificationUsecase,
} from "@application/usecase/taskNotification.usecase.js";
import { SSERealtimeGateway } from "@infrastructure/gateway/realtime.js";
import Consumer from "@infrastructure/service/message/consumer.message.js";
import { createSSERoute } from "@infrastructure/sse/sseRealTime.js";

export async function buildContainer() {
  const consumer = await Consumer.create();

  const realtimeGateway = new SSERealtimeGateway();
  const notifierUsecase = new NotifiterUsecase(consumer, realtimeGateway);
  const sectionCreate = new SectionCreateNotificationUsecase(
    consumer,
    realtimeGateway,
  );
  const sectionRemove = new SectionRemoveNotificationUsecase(
    consumer,
    realtimeGateway,
  );
  const sectionUpdate = new SectionUpdateNotificationUsecase(
    consumer,
    realtimeGateway,
  );
  const sectionChangePosition = new SectionChangePositionNotificationUsecase(
    consumer,
    realtimeGateway,
  );
  const taskCreate = new TaskCreateNotificationUsecase(
    consumer,
    realtimeGateway,
  );
  const taskRemove = new TaskRemoveNotificationUsecase(
    consumer,
    realtimeGateway,
  );

  const taskUpdate = new TaskUpdateNotificationUsecase(
    consumer,
    realtimeGateway,
  );
  return {
    realtimeGateway,
    notifierUsecase,
    taskCreate,
    taskRemove,
    taskUpdate,
    sectionCreate,
    sectionRemove,
    sectionUpdate,
    sectionChangePosition,
    sseRoute: createSSERoute(realtimeGateway),
  };
}
