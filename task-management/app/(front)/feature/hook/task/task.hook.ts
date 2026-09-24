import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import React from "react";
import { useUpdateRule,useRemoveTask,useUpdateTask,useUpdateTaskStatus} from "../useTaskMutation.hook";
import { useShallow } from "zustand/react/shallow";

const useTaskHook = (taskId: string) => {
const isTemp = (id: string) => id.startsWith("temp-");

  const task = useWorkspaceStore(useShallow(state=>state.taskIndex[taskId]));
  const addTaskStore = useWorkspaceStore((state) => state.addTask);
  const updateTaskStore = useWorkspaceStore((state) => state.updateTask);
  const removeTaskStore = useWorkspaceStore((state) => state.removeTask);
  const moveTaskIntoSection = useWorkspaceStore(
    (state) => state.moveTaskIntoSection,
  );
  const changeIdTask = useWorkspaceStore((state) => state.changeIdTask);
    const { mutate: updateRule } = useUpdateRule(task?.list ?? "");
    const { mutate: updateTask } = useUpdateTask(task?.list ?? "");
    const { mutate: deleteTask } = useRemoveTask(task?.list ?? "");
    const { mutate: updateStatusApi } = useUpdateTaskStatus();
  return {
    task: task,
    isTemp,
    addTaskStore,
    updateTaskStore,
    removeTaskStore,
    moveTaskIntoSection,
    changeIdTask,
    updateRule,
    updateTask,
    deleteTask,
    updateStatusApi
  };
};

export default useTaskHook;
