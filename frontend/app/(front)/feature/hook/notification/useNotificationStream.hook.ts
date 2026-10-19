import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTaskWithIds } from "../useTaskQuery.hook";
import { useNotification } from "../useNotificationQuery.hook";
import { useNotificationStore } from "../../store/notification/notification.store";
import { useList } from "../useListQuery.hook";
import { useWorkspaceStore } from "../../store/workspace.state";
import { INotificationModel } from "@/app/(front)/model/notification.model";
import { notificationApi } from "../../api/notification/notification.api";
import { ISectionModelState } from "@/app/(front)/model";
import { NotificationConfig } from "@/app/(front)/config/notification.config";


interface RealtimePayload {
  [key: string]: any;
}

const NOTIFICATION_EVENTS = [
  "invite-member",
  "list-delete-notification",
  "list-update-notification",
  "accept-member-notification",
  "deny-member-notification",
  "exit-member-notification",
  "remove-member-notification",
];
export default function useNotificationStream() {
  const queryClient = useQueryClient();
  const pendingIdsRef = useRef<Set<string>>(new Set());
  const notificationConfig = `${NotificationConfig.NOTICATION_URL}/notifications/stream`
  const { mutateAsync: TaskWithIds } = useTaskWithIds();
  const taskWithIdsRef = useRef(TaskWithIds);
  useEffect(() => {
    taskWithIdsRef.current = TaskWithIds;
  }, [TaskWithIds]);

  const { data: initialNotifications } = useNotification();
  const acceptedListId = useNotificationStore((s) => s.acceptedListId);
  const { data: list, isError } = useList(acceptedListId);

  const addTask = useWorkspaceStore((s) => s.addTask);
  const updateTask = useWorkspaceStore((s) => s.updateTask);
  const updateRule = useWorkspaceStore((s) => s.updateRule);
  const removeTask = useWorkspaceStore((s) => s.removeTask);
  const updateStatusMember = useWorkspaceStore((s) => s.updateStatusMember);
  const addSection = useWorkspaceStore((s) => s.addSection);
  const addList = useWorkspaceStore((s) => s.addList);
  const removeList = useWorkspaceStore((s) => s.removelistIndex);
  const updateList = useWorkspaceStore((s) => s.updateListIndex);
  const removeMember = useWorkspaceStore((s) => s.removeMember);
  const removeSection = useWorkspaceStore((s) => s.removeSection);
  const updateSection = useWorkspaceStore((s) => s.setSectionIndex);
  const changePositionSection = useWorkspaceStore((s) => s.moveSection);
  const updateRole = useWorkspaceStore((s) => s.setUpdateRoleMember);

  // Danh sách ban đầu từ REST
  useEffect(() => {
    if (Array.isArray(initialNotifications)) {
      useNotificationStore
        .getState()
        .mergeOlder(initialNotifications as INotificationModel[]);
    }
  }, [initialNotifications]);

  // Chấp nhận lời mời -> thêm list vào workspace
  useEffect(() => {
    if (!acceptedListId || !list) return;
    addList(list);
    useNotificationStore.getState().setAcceptedListId("");
  }, [list, acceptedListId, addList]);

  useEffect(() => {
    if (!isError) return;
    toast.error("Không tải được danh sách, vui lòng thử lại");
    useNotificationStore.getState().setAcceptedListId("");
  }, [isError]);

  const pushNotification = useCallback(
    async (payload: RealtimePayload) => {
      const id: string | undefined = payload?.id;
      if (!id || pendingIdsRef.current.has(id)) return;
      pendingIdsRef.current.add(id);
      const { addNotification } = useNotificationStore.getState();
      try {
        const detail = await queryClient.fetchQuery({
          queryKey: ["notification", id],
          queryFn: () => notificationApi.detail(id),
          staleTime: 60_000,
        });
        addNotification(detail);
      } catch (err) {
        console.error("[SSE] lấy chi tiết notification thất bại", err);
        addNotification(payload as unknown as INotificationModel);
      } finally {
        pendingIdsRef.current.delete(id);
      }
    },
    [queryClient],
  );

  useEffect(() => {
    const { setConnect } = useNotificationStore.getState();
    const es = new EventSource(notificationConfig, { withCredentials: true });

    const on = (
      name: string,
      handler: (payload: RealtimePayload) => void | Promise<void>,
    ) => {
      es.addEventListener(name, async (event) => {
        try {
          const payload: RealtimePayload = JSON.parse(
            (event as MessageEvent).data,
          );
          await handler(payload);
        } catch (err) {
          console.error(`[SSE] ${name} xử lý thất bại`, err);
        }
      });
    };

    es.onopen = () => {
      setConnect(true);
      // Bù các thông báo bị lỡ khi mất kết nối.
      // TODO: đổi key cho khớp với key trong useNotification()
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };
    es.onerror = (err) => {
      console.error("[SSE] Lỗi kết nối:", err);
      setConnect(false);
    };

    NOTIFICATION_EVENTS.forEach((name) =>
      on(name, (p) => pushNotification(p)),
    );

    on("task-create", async (p) => {
      const { ids, listId } = p.data;
      const tasks = await taskWithIdsRef.current({ ids, listId });
      tasks.forEach((t) => addTask(t));
    });
    on("task-update-status", async (p) => {
      const { taskIds, listId } = p.data as {
        taskIds: string[];
        listId: string;
      };
      const tasks = await taskWithIdsRef.current({ ids: taskIds, listId });
      tasks.forEach((t) => updateTask(t.id, { ...t }));
    });
    on("task-update", (p) => updateTask(p.data.id, p.data));
    on("task-delete", (p) => removeTask(p.data.id));
    on("list-delete", (p) => removeList(p.data.id));
    on("list-update", (p) => updateList(p.data.id, { name: p.data.name }));
    on("accept-member", (p) => updateStatusMember(p.data.listId, p.data.member));
    on("deny-member", (p) => updateStatusMember(p.data.listId, p.data.member));
    on("change.role.member", (p) =>
      updateRole({
        email: p.data.email,
        listId: p.data.listId,
        role: p.data.role,
      }),
    );
    on("exit-member", (p) =>
      removeMember({ listId: p.data.listId, email: p.data.email }),
    );
    on("remove-member", (p) =>
      removeMember({ listId: p.data.listId, email: p.data.email }),
    );
    on("remove-own-member", (p) => removeList(p.data.listId));
    on("section-create", (p) =>
      addSection(
        p.data.listId,
        p.data as Pick<ISectionModelState, "name" | "id">,
      ),
    );
    on("section-delete", (p) => removeSection(p.data.id));
    on("section-update", (p) => updateSection(p.data.id, p.data));
    on("section-change-position", (p) =>
      changePositionSection(p.data.startId, p.data.endId),
    );
    on("rule-update", (p) => updateRule(p.data.task, { ...p.data }));

    return () => es.close();
  }, [notificationConfig, pushNotification, queryClient]);
}