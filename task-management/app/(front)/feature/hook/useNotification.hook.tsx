import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNotification } from "./useNotificationQuery.hook";
import { INotificationModel } from "../../model/notification.model";
import { useReadNotification } from "./useNotificationMutate.hook";
import { useAcceptOrDenyInvite } from "./useMemberMutation.hook";
import { toast } from "sonner";
import { ApiError } from "../../lib/axios";
import { useWorkspaceStore } from "../../states/workspace.state";
import { ISectionModelState, ITaskModel } from "../../model";

interface RealtimePayload {
  [key: string]: any;
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
  const addTask = useWorkspaceStore((state) => state.addTask);
  const updateTask = useWorkspaceStore((state)=>state.updateTask)
  const removeTask = useWorkspaceStore((state)=>state.removeTask)
  const moveTask = useWorkspaceStore((state)=>state.moveTaskIntoSection)
  const addSection = useWorkspaceStore((state)=>state.addSection)
  const removeSection = useWorkspaceStore((state)=>state.removeSection)
  const updateSection = useWorkspaceStore((state)=>state.setSectionIndex)
  const changePositionSection = useWorkspaceStore((state)=>state.moveSection)
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
    const previousNotification = notification;
    setNotification((prev) =>
      prev.map((value) =>
        value.id === notificationId
          ? { ...value, data: { ...value.data, status } }
          : value,
      ),
    );

    acceptOrDeny(
      { listId, status },
      {
        onError(error: Error) {
          setNotification(previousNotification);
          if (!(error instanceof ApiError)) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
            return;
          }
          switch (error.code) {
            case "NOT_FOUND":
              toast.error("Lời mời hoặc danh sách này không còn tồn tại");
              break;
            case "FORBIDDEN":
              toast.error("Bạn không có quyền với lời mời này");
              break;
            case "TIME_OUT":
              toast.error("Lời mời đã hết hạn");
              break;
            case "BAD_REQUEST":
              toast.error(error.message);
              break;
            default:
              toast.error("Có lỗi xảy ra, vui lòng thử lại");
          }
        },
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
      console.log(payload);
      setNotification((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload as unknown as INotificationModel, ...prev];
      });
    });
    es.addEventListener("task-create", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      console.log(payload.data);
      addTask(payload.data as unknown as ITaskModel);
    });

    es.addEventListener("task-update", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      console.log(payload.data);
      updateTask(payload.data.id,payload.data)
    });

    es.addEventListener("task-delete", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      removeTask(payload.data.id)
    });

    es.addEventListener("section-create", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      console.log(payload)
      addSection(payload.data.listId,payload.data as Pick<ISectionModelState,"name"|"id">)
    });

    
    es.addEventListener("section-delete", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      console.log(payload)
      removeSection(payload.data.id)
    });

    es.addEventListener("section-update", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      console.log(payload)
      updateSection(payload.data.id,payload.data)
    });

    es.addEventListener("section-change-position", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      console.log(payload)
      changePositionSection(payload.data.startId,payload.data.endId)
    });


    es.onerror = (err) => {
      console.log(err);
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
