import { listRemoveNotificationUsecase, listUpdateNotificationUsecase } from "@application/usecase/list.notification.usecase.js";
import { AcceptStatusMemberNotificationUsecase, DenyStatusMemberNotificationUsecase, ExitMemberNotificationUsecase, RemoveMemberNotificationUsecase, RemoveMemberOwnNotificationUsecase, UpdateRoleMemberNotificationUsecase } from "@application/usecase/member.notification.usecase.js";
import NotifiterUsecase from "@application/usecase/realtime.usecase.js";
import {
  SectionChangePositionNotificationUsecase,
  SectionCreateNotificationUsecase,
  SectionRemoveNotificationUsecase,
  SectionUpdateNotificationUsecase,
} from "@application/usecase/section.notification.usecase.js";
import {
  RuleUpdateNotificationUsecase,
  TaskCreateNotificationUsecase,
  TaskRemoveNotificationUsecase,
  TaskUpdateNotificationUsecase,
  TaskUpdateStatusNotificationUsecase,
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
  const taskUpdateStatus = new TaskUpdateStatusNotificationUsecase(consumer, realtimeGateway);

    const ruleUpdate = new RuleUpdateNotificationUsecase(
    consumer,
    realtimeGateway,
  );
  const listUpdate = new listUpdateNotificationUsecase(consumer,realtimeGateway)
  const listDelete = new listRemoveNotificationUsecase(consumer,realtimeGateway)
  const acceptStatusMember = new AcceptStatusMemberNotificationUsecase(consumer,realtimeGateway)
  const denyStatusMember = new DenyStatusMemberNotificationUsecase(consumer,realtimeGateway)
  const removeMember = new RemoveMemberNotificationUsecase(consumer,realtimeGateway)
  const updateRoleMember = new UpdateRoleMemberNotificationUsecase(consumer,realtimeGateway)
  const exitMember = new ExitMemberNotificationUsecase(consumer,realtimeGateway)
  const removeOwnMember = new RemoveMemberOwnNotificationUsecase(consumer,realtimeGateway)
  return {removeOwnMember,
    acceptStatusMember,
    denyStatusMember,
    listUpdate,
    listDelete,
    realtimeGateway,
    notifierUsecase,
    taskCreate,
    taskRemove,
    taskUpdate,
    taskUpdateStatus,
    ruleUpdate,
    sectionCreate,
    sectionRemove,
    exitMember,
    sectionUpdate,
    sectionChangePosition,
    removeMember,
    updateRoleMember,
    sseRoute: createSSERoute(realtimeGateway),
  };
}
