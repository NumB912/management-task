"use client";

import { Button } from "../ui/button";
import { INotificationModel } from "../../model/notification.model";
import NotificationItem from "./notificationItem";

export interface RespondPayload {
  notificationId: string;
  status: "accept" | "deny";
  listId: string;
}

interface InviteData {
  id: string;
  listId: string;
  status: "deny" | "accept" | "pending";
}

interface InviteMemberNotificationProps {
  notification: INotificationModel;
  onRespond: (payload: RespondPayload) => void;
}

export default function InviteMemberNotification({
  notification: n,
  onRespond,
}: InviteMemberNotificationProps) {
  const inviteData = n.data ? (n.data as unknown as InviteData) : undefined;

  const respond = (status: "accept" | "deny") => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inviteData) return;
    onRespond({
      notificationId: n.id,
      status,
      listId: inviteData.listId,
    });
  };

  return (
    <NotificationItem notification={n}>
      {inviteData && (
        <div className="w-full flex justify-end items-center gap-2 mt-2">
          {inviteData.status === "pending" ? (
            <>
              <Button
                onClick={respond("deny")}
                className="px-3 rounded-full"
                variant="outline"
              >
                Không
              </Button>
              <Button onClick={respond("accept")} className="rounded-full px-3">
                Đồng ý
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground h-full">
              {inviteData.status === "accept" ? "Đã chấp nhận" : "Đã từ chối"}
            </span>
          )}
        </div>
      )}
    </NotificationItem>
  );
}