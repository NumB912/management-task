"use client";

import { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { INotificationModel } from "../../model/notification.model";
import { formatDate } from "../../utils/getDayOfMonth.utils";
import { getInitials } from "../../utils/actor.utils";
import { resolveSrc } from "../../utils/readURL.utils";
import { EVENT_META, formatMessage, getActor } from "./notificationMeta";


interface NotificationItemProps {
  notification: INotificationModel;
  onClick?: (n: INotificationModel) => void;
  children?: ReactNode; 
}

export default function NotificationItem({
  notification: n,
  onClick,
  children,
}: NotificationItemProps) {
  const actor = getActor(n.data ?? {});
  const meta = EVENT_META[n.event];
  const Icon = meta?.icon;

  return (
    <div
      className={`flex gap-3 px-4 py-3
        cursor-pointer hover:bg-accent/40 relative h-full
      ${n.is_read ? "" : "bg-primary/5"}`}
      onClick={() => onClick?.(n)}
    >
      <div className="relative shrink-0">
        <Avatar className="size-17 relative">
          <AvatarImage src={resolveSrc(actor.avatar)} />
          <AvatarFallback>{getInitials(actor.name)}</AvatarFallback>
                  {Icon && (
          <span
            className={`absolute w-6 h-6 right-0 bottom-0 flex p-1.5 items-center justify-center rounded-full z-10 ${meta.badgeClass}`}
          >
            <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
          </span>
        )}
        </Avatar>
      </div>

      <div className="min-w-0 flex-1 flex flex-col h-full">
        <p className="text-sm leading-snug">
          {formatMessage(n.event, n.data)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {n.created_at && formatDate(n.created_at)}
        </p>
        {children}
      </div>
    {!n.is_read&& <div className="p-1 bg-destructive rounded-full aspect-rounded absolute top-3 right-3"/>
  }
    </div>
  );
}