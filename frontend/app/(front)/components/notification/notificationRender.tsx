"use client";

import { INotificationModel } from "../../model/notification.model";
import InviteMemberNotification, { RespondPayload } from "./notificationInvite";
import NotificationItem from "./notificationItem";
import { INVITE_EVENT } from "./notificationMeta";

interface NotificationRendererProps {
  notification: INotificationModel;
  onItemClick: (n: INotificationModel) => void;
  onRespond: (payload: RespondPayload) => void;
}

export default function NotificationRenderer({
  notification: n,
  onItemClick,
  onRespond,
}: NotificationRendererProps) {
  if (n.event === INVITE_EVENT) {
    return <InviteMemberNotification notification={n} onRespond={onRespond} />;
  }
  return <NotificationItem notification={n} onClick={onItemClick} />;
}