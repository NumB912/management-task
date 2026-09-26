import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNotification } from "./useNotificationQuery.hook";
import { INotificationModel } from "../../model/notification.model";
import { useReadNotification } from "./useNotificationMutate.hook";
import { useAcceptOrDenyInvite } from "./useMemberMutation.hook";

interface RealtimePayload {
  type: string;
  [key: string]: unknown;
}

const useNotifications = (apiUrl: string) => {
  const [notification, setNotification] = useState<INotificationModel[]>([]);
  const [open, setOpen] = useState(false);
  const [connect, setConnect] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { mutate: acceptOrDeny } = useAcceptOrDenyInvite();
  const eventSourceRef = useRef<EventSource | null>(null);
  const { data } = useNotification();
  const { mutate: updateRead } = useReadNotification();

  useEffect(() => {
    if (data) setNotification(data);
  }, [data]);


  const filterUnReadNotification = useMemo(
    () => notification.filter((n) => !n.is_read),
    [notification],
  );


  const handleRespond = ({
    notificationId,
    status,
    listId,
  }: {
    status: "accept" | "deny";
    listId?: string;
    notificationId: string;
  }) => {
    if (!listId) {
      console.warn("[NotificationBell] Thiếu listId, không thể xử lý");
      return;
    }

    setNotification((prev) =>
      prev.map((value) =>
        value.id === notificationId
          ? { ...value, data: { ...value.data, status } }
          : value,
      ),
    );
    setOpen(false);
    acceptOrDeny(
      { listId, status },
      {
        onError(error, variables, onMutateResult, context) {},
        onSuccess(data, variables, onMutateResult, context) {},
      },
    );
  };

  useEffect(() => {
    const es = new EventSource(apiUrl, { withCredentials: true });
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log("mở cổng notifier");
      setConnect(true);
    };

    es.addEventListener("invite-member", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      console.log("[SSE] Nhận:", payload);
      setNotification((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload as unknown as INotificationModel, ...prev];
      });
    });

    es.onerror = (err) => {
      console.error("[SSE] Lỗi kết nối:", err);
      setConnect(false);
    };

    return () => {
      es.close();
    };
  }, [apiUrl]);

  const clearUnreadCount = () => setUnreadCount(0);

  return {
    notification,
    filterUnReadNotification,
    connect,
    setConnect,
    setNotification,
    updateRead,
    unreadCount,
    clearUnreadCount,
    acceptOrDeny,
    handleRespond,
    open,
    setOpen,
  };
};

export default useNotifications;