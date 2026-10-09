// feature/hook/task/useTask.hook.ts
import { useContext, useEffect, useRef } from "react";
import { toast } from "sonner";
import ObjectID from "bson-objectid";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import {
  useUpdateRule,
  useRemoveTask,
  useUpdateTask,
  useUpdateTaskStatus,
} from "../useTaskMutation.hook";
import { useCreateTag } from "../useTagMutation.hook";
import { ITaskModel } from "../../../model";
import { IRuleModel } from "../../../model/rule/rule.model";
import { IStatus } from "../../../model/type/type";
import { getNextOccurrence } from "../../../utils/caculateNextDay";
import { useAudio } from "@/app/(front)/providers/audio.provider";

type Pending = {
  status: ITaskModel["status"];
  record: Record<string, { date: Date; rule: string }>;
  snapshot: { status: ITaskModel["status"]; rule: ITaskModel["rule"] };
};

const canRecur = (task: ITaskModel, nextDate: Date | null): nextDate is Date => {
  if (!nextDate || !task.rule.start_date) return false;
  const until = task.rule.repeat.until && new Date(task.rule.repeat.until);
  return !until || nextDate.getTime() <= until.getTime();
};

export function useTask(taskId: string) {
  const {playBubble} = useAudio()
  const task = useWorkspaceStore((s) => s.taskIndex[taskId]);
  const addTaskStore = useWorkspaceStore((s) => s.addTask);
  const updateTaskStore = useWorkspaceStore((s) => s.updateTask);
  const removeTaskStore = useWorkspaceStore((s) => s.removeTask);
  const moveTaskIntoSection = useWorkspaceStore((s) => s.moveTaskIntoSection);

  const listId = task?.list ?? "";
  const { mutate: updateRule } = useUpdateRule(listId);
  const { mutate: updateTask } = useUpdateTask(listId);
  const { mutate: deleteTask } = useRemoveTask(listId);
  const { mutate: updateStatusApi } = useUpdateTaskStatus();
  const { mutate: createTag } = useCreateTag();
  const pendings = useRef<Record<string, Pending>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const flush = (id: string) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    const p = pendings.current[id];
    if (!p) return;
    delete pendings.current[id];
    updateStatusApi({
      taskId: id,
      data: { id, record: p.record, status: p.status },
    });
  };
  useEffect(() => {
    return () => {
      Object.keys(pendings.current).forEach(flush);
    };
   }, []);

  const schedule = (
    id: string,
    status: IStatus,
    tempId: string | undefined,
    rule: string | undefined,
    snapshot: Pending["snapshot"],
    nextDate?: Date,
  ) => {
    if (pendings.current[id] && pendings.current[id].status !== status) {
      flush(id);
    }
    const p = (pendings.current[id] ??= { status, record: {}, snapshot });
    if (tempId && nextDate) {
      p.record[tempId] = { date: new Date(nextDate), rule: rule ?? "" };
    }
    clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => flush(id), 200);
  };

  const handleUpdateTask = (id: string, data: Partial<ITaskModel>) => {
    const prev = task;
    if (!prev) return;
    const { section, ...rest } = data;
    const isMoving = !!section && section !== prev.section;
    const restKeys = Object.keys(rest) as (keyof ITaskModel)[];

    if (isMoving) moveTaskIntoSection(id, section!);
    if (restKeys.length) updateTaskStore(id, rest);

    updateTask(
      { taskId: id, data },
      {
        onError: () => {
          if (isMoving) moveTaskIntoSection(id, prev.section!);
          if (restKeys.length) {
            updateTaskStore(
              id,
              Object.fromEntries(restKeys.map((k) => [k, prev[k]])),
            );
          }
          toast.error("Không thể cập nhật task");
        },
      },
    );
  };

  const handleUpdateRule = (id: string, data: Partial<IRuleModel>) => {
    const prev = task;
    if (!prev) return;
    updateTaskStore(id, { rule: { ...prev.rule, ...data } });
    updateRule(
      { taskId: id, data },
      {
        onError: () => {
          updateTaskStore(id, { rule: prev.rule });
          toast.error("Không thể cập nhật lịch/ưu tiên");
        },
      },
    );
  };

  const handleUpdateTags = (tags: string[]) => handleUpdateRule(taskId, { tags });

  const handleCreateTag = (name: string) => createTag({ name });

  const handleUpdateStatusTask = (id: string, status: IStatus) => {
    const current = task;
    if (!current) return;

    const snapshot = { status: current.status, rule: current.rule };
    const { next, isEnded } = getNextOccurrence(current);
    const tempId = new ObjectID().toHexString();
    const rule = new ObjectID().toHexString();

    if (next && current.rule.start_date && canRecur(current, next)) {
      addTaskStore({
        ...current,
        id: tempId,
        status,
        rule: { ...current.rule, id: rule, repeat: { mode: "none" } },
      });
      updateTaskStore(id, {
        status: "pending",
        rule: { ...current.rule, start_date: next },
      });
      schedule(id, status, tempId, rule, snapshot, current.rule.start_date);
    } else if (isEnded && status === "done") {
      updateTaskStore(id, { status });
      schedule(id, status, tempId, rule, snapshot, current.rule.start_date!);
    } else {
      updateTaskStore(id, { status });
      schedule(id, status, undefined, undefined, snapshot);
    }
    playBubble()
  };

  const toggleStatus = () => {
    if (!task) return;
    handleUpdateStatusTask(task.id, task.status !== "pending" ? "pending" : "done");
  };

  const handleDeleteTask = (id: string) => {
    removeTaskStore(id);
    deleteTask(id, { onError: () => toast.error("Không thể xoá task") });
  };

  return {
    task,
    handleUpdateTask,
    handleUpdateRule,
    handleUpdateTags,
    handleCreateTag,
    handleUpdateStatusTask,
    toggleStatus,
    handleDeleteTask,
  };
}