import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNotification } from "./useNotificationQuery.hook";
import { INotificationModel } from "../../model/notification.model";
import { useReadNotification } from "./useNotificationMutate.hook";
import { useAcceptOrDenyInvite } from "./useMemberMutation.hook";
import { toast } from "sonner";
import { ApiError } from "../../lib/axios";
import { useWorkspaceStore } from "../../states/workspace.state";
import { ISectionModelState, ITaskModel } from "../../model";
import { IStatus } from "../../model/type/type";
import { useList } from "./useListQuery.hook";

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
  const updateTask = useWorkspaceStore((state) => state.updateTask);
  const updateRule = useWorkspaceStore((state) => state.updateRule);
  const removeTask = useWorkspaceStore((state) => state.removeTask);
  const updateStatusMember = useWorkspaceStore(
    (state) => state.updateStatusMember,
  );
  const addSection = useWorkspaceStore((state) => state.addSection);
  const addList = useWorkspaceStore((state) => state.addList);
  const removeList = useWorkspaceStore((state) => state.removelistIndex);
  const updateList = useWorkspaceStore((state) => state.updateListIndex);
  const removeMember = useWorkspaceStore((state) => state.removeMember);
  const removeSection = useWorkspaceStore((state) => state.removeSection);
  const updateSection = useWorkspaceStore((state) => state.setSectionIndex);
  const changePositionSection = useWorkspaceStore((state) => state.moveSection);
  const updateRole = useWorkspaceStore((state) => state.setUpdateRoleMember);
  const [acceptedListId, setAcceptedListId] = useState("");
  const { data: list, isError } = useList(acceptedListId);
  useEffect(() => {
    if (data) setNotification(data);
  }, [data]);

  useEffect(() => {
    if (!acceptedListId || !list) return;
    addList(list);
    setAcceptedListId("");
  }, [list, acceptedListId, addList]);

  useEffect(() => {
    if (!isError) return;
    toast.error("Không tải được danh sách, vui lòng thử lại");
    setAcceptedListId("");
  }, [isError]);

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
        onSuccess(data, variables, onMutateResult, context) {
          if (status == "accept") setAcceptedListId(listId);
        },
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

      setNotification((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload as unknown as INotificationModel, ...prev];
      });
    });

    es.addEventListener("task-update-status", (event: MessageEvent) => {
      try {
        const payload: RealtimePayload = JSON.parse(event.data);
        const { record, task: base } = payload.data as unknown as {
          record: Record<string, { date: string; rule: string }>;
          task: ITaskModel;
          status?: IStatus;
        };

        const { taskIndex } = useWorkspaceStore.getState();
        const status = (payload.data as any).status ?? "completed";
        if (payload.data.type == "single") {
          updateTask(payload.data.id, {
            status: status,
          });
        }

        if (payload.data.type === "recurring") {
          for (const [tempId, pair] of Object.entries(record ?? {})) {
            if (taskIndex[tempId]) continue;

            addTask({
              ...base,
              id: tempId,
              status,
              done_at: new Date(),
              rule: {
                ...base.rule,
                id: pair.rule,
                task: tempId,
                repeat: { mode: "none" },
                start_date: new Date(pair.date),
              },
            });
          }

          updateTask(base.id, {
            status: base.status,
            done_at: base.done_at,
            rule: {
              ...base.rule,
            },
          });
        }
      } catch (err) {
        console.error("[SSE] task-update-status parse failed", err);
      }
    });

    es.addEventListener("list-delete-notification", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      setNotification((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload as unknown as INotificationModel, ...prev];
      });
    });

    es.addEventListener("list-delete", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);

      removeList(payload.data.id);
    });

    es.addEventListener("list-update", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      updateList(payload.data.id, {
        name: payload.data.name,
      });
    });

    es.addEventListener("list-update-notification", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      setNotification((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload as unknown as INotificationModel, ...prev];
      });
    });

    es.addEventListener("accept-member", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      updateStatusMember(payload.data.listId, payload.data.member);
    });

    es.addEventListener("change.role.member", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      updateRole({
        email: payload.data.email,
        listId: payload.data.listId,
        role: payload.data.role,
      });
    });

    es.addEventListener("accept-member-notification", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      setNotification((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload as unknown as INotificationModel, ...prev];
      });
    });

    es.addEventListener("list-delete-notification", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      setNotification((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload as unknown as INotificationModel, ...prev];
      });
    });

    es.addEventListener("exit-member-notification", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      setNotification((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload as unknown as INotificationModel, ...prev];
      });
    });

    es.addEventListener("deny-member", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      updateStatusMember(payload.data.listId, payload.data.member);
    });

    es.addEventListener("deny-member-notification", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      setNotification((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload as unknown as INotificationModel, ...prev];
      });
    });
    es.addEventListener("remove-member-notification", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      setNotification((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload as unknown as INotificationModel, ...prev];
      });
    });

    es.addEventListener("task-create", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      addTask(payload.data as unknown as ITaskModel);
    });

    es.addEventListener("task-update", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      updateTask(payload.data.id, payload.data);
    });

    es.addEventListener("task-delete", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      removeTask(payload.data.id);
    });

    es.addEventListener("section-create", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);

      addSection(
        payload.data.listId,
        payload.data as Pick<ISectionModelState, "name" | "id">,
      );
    });

    es.addEventListener("section-delete", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);

      removeSection(payload.data.id);
    });

    es.addEventListener("section-update", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);

      updateSection(payload.data.id, payload.data);
    });

    es.addEventListener("section-change-position", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);

      changePositionSection(payload.data.startId, payload.data.endId);
    });

    es.addEventListener("rule-update", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);

      updateRule(payload.data.task, {
        ...payload.data,
      });
    });

    es.addEventListener("exit-member", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);
      
      removeMember({
        listId: payload.data.listId,
        email: payload.data.email,
      });
    });

    es.addEventListener("remove-member", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);

      removeMember({
        listId: payload.data.listId,
        email: payload.data.email,
      });
    });

    es.addEventListener("remove-own-member", (event) => {
      const payload: RealtimePayload = JSON.parse(event.data);

      removeList(payload.data.listId);
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
