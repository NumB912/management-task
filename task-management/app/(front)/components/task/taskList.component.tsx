import React, { useEffect, useState } from "react";
import { ITaskModel } from "../../model";
import { Task } from "./taskCard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronLeft } from "lucide-react";
import { IStatus } from "../../model/type/type";

interface TaskSectionProp {
  tasks: ITaskModel[];
}

export const TaskList = ({ tasks }: TaskSectionProp) => {
  const [taskCompleteOrWontDo, setTaskCompleteOrWontDo] = useState<
    ITaskModel[]
  >([]);
  const [taskPending, setTaskPending] = useState<ITaskModel[]>([]);
  const [openCollapsible, setOpenCollapsible] = useState<boolean>(true);
  useEffect(() => {
    setTaskCompleteOrWontDo(tasks.filter((task) => task.status !== "pending"));
    setTaskPending(tasks.filter((task) => task.status === "pending"));
  }, [tasks]);

  const handleUpdateTaskStatus = (id: string, status: IStatus) => {
    const isMovingToPending = status === "pending";
    const source = isMovingToPending ? taskCompleteOrWontDo : taskPending;
    const task = source.find((t) => t.id === id);
    if (!task) return;
    const updated = { ...task, status };

    if (isMovingToPending) {
      setTaskCompleteOrWontDo((prev) => prev.filter((t) => t.id !== id));
      setTaskPending((prev) => [updated, ...prev]);
    } else {
      setTaskPending((prev) => prev.filter((t) => t.id !== id));
      setTaskCompleteOrWontDo((prev) => [...prev, updated]);
    }
  };
  const deleteTask = (id: string) => {
    setTaskCompleteOrWontDo((prev) => prev.filter((task) => task.id !== id));
    setTaskPending((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <>
      {taskPending.map((value: ITaskModel) => (
        <div
          key={value.id}
          className="flex gap-2 items-center bg-white w-full mt-2 rounded-md border border-gray-200 shadow  "
        >
          <Task
            task={value}
            onDelete={deleteTask}
            onUpdateStatus={handleUpdateTaskStatus}
            depth={0}
          />
        </div>
      ))}
      {taskCompleteOrWontDo.length > 0 && (
        <Collapsible
          key={"completed-tasks"}
          open={openCollapsible}
          onOpenChange={(open) => setOpenCollapsible(open)}
          className="mt-2 w-full"
        >
          <CollapsibleTrigger className="w-full text-xs font-bold p-2 flex gap-2 items-center">
            <ChevronLeft
              className={`w-4 h-4 transition-all ${openCollapsible && "-rotate-90"}`}
            />
            <span className="flex items-center gap-1">

              Hoàn thành/Không làm
              <span className="text-neutral-400 font-normal shrink-0 text-center">
                {taskCompleteOrWontDo.length}
              </span>
            </span>
          </CollapsibleTrigger>

          <CollapsibleContent>
            {taskCompleteOrWontDo.map((value: ITaskModel) => (
              <div
                key={value.id}
                className="flex gap-2 items-center bg-white w-full mt-2 rounded-md border border-gray-200 shadow  "
              >
                <Task
                key={value.id}
                onUpdateTask={()=>{}}
                  task={value}
                  onDelete={deleteTask}
                  onUpdateStatus={handleUpdateTaskStatus}
                  depth={0}
                />
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </>
  );
};
