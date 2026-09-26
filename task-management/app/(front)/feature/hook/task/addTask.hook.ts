
import { useCallback } from "react";
import { toast } from "sonner"; 
import { useCreateTaskWithSection } from "@/app/(front)/feature/hook/useTaskMutation.hook";
import { ITaskModel } from "@/app/(front)/model";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";

export function useAddTask(listId: string,sectionId:string) {
  const addTask = useWorkspaceStore((s) => s.addTask);
  const changeIdTask = useWorkspaceStore((s) => s.changeIdTask);
  const removeTask = useWorkspaceStore((s) => s.removeTask);
  const { mutateAsync } = useCreateTaskWithSection(listId,sectionId);

  return useCallback(
    async (task: ITaskModel) => {
      const tempId = `temp-task-${crypto.randomUUID()}`;
      addTask({ ...task, id: tempId }); 
      try {
        const data = await mutateAsync({
          section:sectionId,
          list: task.list,
          name: task.name,
          description: task.description,
          rule: {
            repeat: task.rule.repeat,
            tags: task.rule.tags,
            end_date: task.rule.end_date,
            priority: task.rule.priority,
            start_date: task.rule.start_date,
            timer: task.rule.timer,
          },
        });

        const realId = data.id.toString();
        changeIdTask(tempId, realId);
        return realId;
      } catch {
        removeTask(tempId)
        toast.error("Không thể tạo task");
        return null;
      }
    },
    [addTask, changeIdTask, removeTask, mutateAsync],
  );
}