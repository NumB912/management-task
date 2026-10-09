
import { useCallback } from "react";
import { toast } from "sonner"; 
import { ITaskModel } from "@/app/(front)/model";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import ObjectID from "bson-objectid";
import { useCreateTask } from "../useTaskMutation.hook";

export function useAddTask() {
  const addTask = useWorkspaceStore((s) => s.addTask);
  const removeTask = useWorkspaceStore((s) => s.removeTask);
  const { mutateAsync } = useCreateTask();
  return useCallback(
    async (task: ITaskModel) => {
      const id = new ObjectID().toString();
      console.log(task)
      addTask({ ...task, id: id }); 
      try {
        await mutateAsync({
          ...task,
          id: id
        });
        return id;
      } catch {
        removeTask(id)
        toast.error("Không thể tạo task");
        return null;
      }
    },
    [addTask, removeTask, mutateAsync],
  );
}