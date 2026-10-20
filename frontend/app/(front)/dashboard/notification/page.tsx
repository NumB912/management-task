"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Separator } from "../../components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";
import { INotificationModel } from "../../model/notification.model";
import { NAVIGABLE_EVENTS } from "../../components/notification/notificationMeta";
import NotificationRenderer from "../../components/notification/notificationRender";
import useNotifications from "../../feature/hook/notification/notification.hook";
export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    filterUnReadnotifications,
    updateRead,
    setNotifications,
    handleRespond,
    markAllRead
  } = useNotifications();
  const [valueToggle, setValueToggle] = useState<"unread" | "all">("all");
  const filteredNotification =
    valueToggle === "unread" ? filterUnReadnotifications : notifications;
  const hasUnread = notifications.some((n) => !n.is_read);
useEffect(() => {
  const snapshot = notifications;
  updateRead(undefined, {
    onError: () => {
      setNotifications(snapshot);
    },
  });

  
}, [hasUnread, notifications, setNotifications, updateRead]);
const leaveTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
 
useEffect(() => {
  clearTimeout(leaveTimerRef.current!); 
  return () => {
    leaveTimerRef.current = setTimeout(() => {
      markAllRead()
    }, 0);
  };
}, [markAllRead]);

  const handleItemClick = (n: INotificationModel) => {
    if (!NAVIGABLE_EVENTS.includes(n.event)) return;
    const listId = (n.data as { listId?: string })?.listId;
    if (!listId) return;
    router.push(`/dashboard/work/lists/${listId}`);
  };

  return (
    <div className="h-screen p-6 flex flex-col items-center overflow-hidden">
      <div className="max-w-3xl w-full flex flex-col h-full min-h-0">
        <h1 className="text-2xl font-bold mb-4 shrink-0">Thông báo</h1>

        <div className="flex items-center justify-center pb-4 shrink-0">
          <ToggleGroup
            type="single"
            value={valueToggle}
            onValueChange={(v) => v && setValueToggle(v as "unread" | "all")}
            className="bg-accent/75 p-1 gap-1 flex justify-center w-full max-w-sm rounded-full"
          >
            <ToggleGroupItem
              value="all"
              className="flex-1 rounded-full data-[state=on]:bg-white font-bold"
            >
              Tất cả
            </ToggleGroupItem>
            <ToggleGroupItem
              value="unread"
              className="flex-1 rounded-full data-[state=on]:bg-white font-bold"
            >
              Chưa đọc {`(${filterUnReadnotifications.length})`}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="bg-white flex flex-col flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-gutter-stable">
          {filteredNotification.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-16 text-center text-sm text-muted-foreground">
              <Bell size={36} />
              {valueToggle === "unread"
                ? "Không có thông báo chưa đọc"
                : "Chưa có thông báo nào"}
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="max-h-100 min-h-25">
                <Separator />
                <NotificationRenderer
                  notification={n}
                  onItemClick={handleItemClick}
                  onRespond={handleRespond}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}