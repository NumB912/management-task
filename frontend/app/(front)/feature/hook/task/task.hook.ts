// feature/hook/task/useTask.hook.ts
import { useContext, useEffect, useRef } from "react";
import { toast } from "sonner";
import ObjectID from "bson-objectid";
import { useWorkspaceStore } from "@/app/(front)/feature/store/workspace.state";
import {
  useUpdateRule,
  useRemoveTask,
  useUpdateTask,
  useUpdateColor,
} from "../useTaskMutation.hook";
import { useCreateTag } from "../useTagMutation.hook";
import { ITaskModel } from "../../../model";
import { IRuleModel } from "../../../model/rule/rule.model";
import { IStatus } from "../../../model/type/type";
import { getNextOccurrence } from "../../../utils/caculateNextDay";
import { useShallow } from "zustand/react/shallow";
import { useTaskStatusBatch } from "@/app/(front)/providers/task.provider";
import { useAudio } from "@/app/(front)/providers/audio.provider";

const canRecur = (
  task: ITaskModel,
  nextDate: Date | null,
): nextDate is Date => {
  if (!nextDate || !task.rule.start_date) return false;
  const until = task.rule.repeat.until && new Date(task.rule.repeat.until);
  return !until || nextDate.getTime() <= until.getTime();
};

export function useTask(taskId: string) {
  const task = useWorkspaceStore(useShallow((s) => s.taskIndex[taskId]));
  const color = useWorkspaceStore(useShallow(s=>s.colorIndex[taskId]))
  const addTaskStore = useWorkspaceStore((s) => s.addTask);
  const updateTaskStore = useWorkspaceStore((s) => s.updateTask);
  const removeTaskStore = useWorkspaceStore((s) => s.removeTask);
  const moveTaskIntoSection = useWorkspaceStore((s) => s.moveTaskIntoSection);
  const updateColorStore = useWorkspaceStore((s)=>s.updateColor)
  const {playBubble} = useAudio()
  const listId = task?.list ?? "";
  const { mutate: updateRule } = useUpdateRule(listId);
  const { mutate: updateTask } = useUpdateTask(listId);
  const { mutate: deleteTask } = useRemoveTask(listId);
  const { mutate: createTag } = useCreateTag();
  const { mutate: updateColor } = useUpdateColor();
  const {schedule} = useTaskStatusBatch()
  const handleUpdateColorTask = (id: string, dataColor: string) => {
    const prev = color?color.color:task.color;
    updateColorStore(id,dataColor,"task");
    updateColor(
      {
        id: id,
        color: dataColor,
        type: "task",
      },
      {
        onError: () => {
          updateColorStore(id,prev,"task");
          toast.error("Không thể cập nhật task");
        },
      },
    );
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

  const handleUpdateTags = (tags: string[]) =>
    handleUpdateRule(taskId, { tags });

  const handleCreateTag = (name: string) => createTag({ name });

const handleUpdateStatusTask = (id: string, status: IStatus) => {
  const current = task;
  playBubble()
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
    schedule(id, status, snapshot,"recurring",{ tempId, rule, date: current.rule.start_date });
  } else if (isEnded && status === "done" && task.rule.repeat.mode !== "none") {
    updateTaskStore(id, { status });
    schedule(id, status, snapshot,"recurring",{ tempId, rule, date: current.rule.start_date! });
  } else {
    updateTaskStore(id, { status });
    schedule(id, status,snapshot,"single");
  }
};
  const toggleStatus = () => {
    if (!task) return;
    handleUpdateStatusTask(
      task.id,
      task.status !== "pending" ? "pending" : "done",
    );
  };

  const handleDeleteTask = (id: string) => {
    removeTaskStore(id);
    deleteTask(id, { onError: () => toast.error("Không thể xoá task") });
  };

  return {
    color,
    task,
    handleUpdateTask,
    handleUpdateRule,
    handleUpdateTags,
    handleCreateTag,
    handleUpdateStatusTask,
    toggleStatus,
    handleDeleteTask,
    handleUpdateColorTask,
  };
}
