"use client";
import { SectionCard } from "@/app/(front)/components/sectionCard.component";
import AddTask from "@/app/(front)/components/task/addTask";
import { TaskList } from "@/app/(front)/components/task/taskList.component";
import { Button } from "@/app/(front)/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/app/(front)/components/ui/card";
import { useCreateTask } from "@/app/(front)/feature/hook/useTaskMutation.hook";
import { ITaskModel } from "@/app/(front)/model";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

const getGroupDateLabel = (tasks: ITaskModel[]): string => {
  const dateValue = tasks[0]?.rule?.start_date;
  if (!dateValue) return "Không rõ ngày";
  const date = new Date(dateValue);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSameDay(date, today)) return "Hôm nay";
  if (isSameDay(date, tomorrow)) return "Ngày mai";
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
};

const getGroupUpComming = (
  tasks: ITaskModel[],
): Record<string, ITaskModel[]> => {
  const groups: Record<string, ITaskModel[]> = {};
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const next7Days = new Date();
  next7Days.setDate(next7Days.getDate() + 7);
  next7Days.setHours(0, 0, 0, 0);
  tasks.forEach((task) => {
    const rawDate = task.rule?.start_date;
    if (!rawDate) return;
    if (rawDate > next7Days || rawDate < now) return;
    const key = new Date(rawDate).toDateString();

    if (groups[key]) {
      groups[key].push(task);
    } else {
      groups[key] = [task];
    }
  });

  return groups;
};

const Page = () => {
  const { setTitle } = useHeader();
  const [isCreateTask, setIsCreateTask] = useState(false);
  const [isAddTask, setIsAddTask] = useState<Record<string, boolean>>({});
  const [isAddPreviousTask, setAddPreviousTask] = useState<boolean>(false);
  const [section, setSection] = useState<{ id: string }>();
  const inbox = useWorkspaceStore((s) => s.inbox);
  const listIndex = useWorkspaceStore(useShallow((s) => s.listIndex));
  const getNextInfo = useWorkspaceStore(useShallow((s) => s.getNextInfo()));
  const getOverdueTasks = useWorkspaceStore(useShallow((s) => s.getOverdueTasks()));
  const changeIdTaskState = useWorkspaceStore((state) => state.changeIdTask);
  const addTaskState = useWorkspaceStore((state) => state.addTask);
  const { mutate: addTaskMutate } = useCreateTask(inbox!);
  useEffect(() => {
    if (!inbox) return;
    const firstSection = listIndex[inbox].sections[0];
    if (firstSection) {
      setSection({ id: firstSection });
    }
  }, [inbox, listIndex]);
  useEffect(() => {
    setTitle("Sắp tới");
  }, []);

  const handleIsAddTask = (id: string) => {
    setIsAddTask((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const overdueTasks = getNextInfo ? getOverdueTasks : [];
  const nextTasks = getNextInfo;
  const sortedGroups = useMemo(() => {
    const groups = getGroupUpComming(nextTasks);
    return Object.entries(groups).sort(
      ([dateKeyA], [dateKeyB]) =>
        new Date(dateKeyA).getTime() - new Date(dateKeyB).getTime(),
    );
  }, [nextTasks]);
  const hasNothingToShow =
    sortedGroups.length === 0 && (!overdueTasks || overdueTasks.length === 0);
  const handleAddTask = (task: ITaskModel) => {
    const task_temp_id = `temp-task-id-${Date.now()}`;
    addTaskState({
      ...task,
      id: task_temp_id,
    });
    addTaskMutate(
      {
        list: task.list,
        name: task.name,
        rule: {
          repeat: task.rule.repeat,
          tags: task.rule.tags,
          end_date: task.rule.end_date,
          priority: task.rule.priority,
          start_date: task.rule.start_date,
          timer: task.rule.timer,
        },
        description: task.description,
      },
      {
        onError(error, variables, onMutateResult, context) {
          
        },
        onSuccess(data, variables, onMutateResult, context) {
          changeIdTaskState(task_temp_id, data.id.toString());
        },
      },
    );
  };
  return (
    <div className="flex gap-3 py-3">
      {hasNothingToShow ? (
        <div className={`${"max-w-xs min-h-0 h-full max-h-xs"}`}>
          <Card className={cn("ring-0 rounded-0 max-w-xs! gap-2 px-0")}>
            <CardHeader className="font-bold flex text-md gap-1 justify-between z-50">
              <span className="flex gap-2">
                <span>Hôm nay</span>
                <span className={cn("text-neutral-400 font-normal")}>{0}</span>
              </span>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreateTask(!isCreateTask);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="rounded hover:bg-gray-200 p-1 text-neutral-600 cursor-pointer relative bg-transparent"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent
              className={cn(
                "p-0! overflow-auto overflow-y-auto gap-0.5 flex flex-col items-center cursor-grab",
                "max-h-[min(60vh,500px)] w-full min-w-[40vh]",
                "sm:max-h-[min(70vh,700px)] sm:max-w-lg!",
                "lg:max-h-[min(79vh,900px)] lg:max-w-md!",
              )}
            >
              {section && inbox && (
                <AddTask
                  isCreate={isCreateTask}
                  setIsCreate={setIsCreateTask}
                  sectionId={section.id}
                  listId={inbox}
                  defaultConfirmRule={{
                    start_date: new Date(),
                  }}
                  onHandle={(task) => {}}
                />
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {overdueTasks.length > 0 && (
            <SectionCard
              count={overdueTasks.length}
              onPlusClick={() => {
                setAddPreviousTask(!isAddPreviousTask);
              }}
              title="Quá hạn"
            >
              {section && inbox && (
                <AddTask
                  isCreate={isAddPreviousTask}
                  setIsCreate={setAddPreviousTask}
                  sectionId={section.id}
                  listId={inbox}
                  defaultConfirmRule={{
                    start_date: (() => {
                      const previous = new Date();
                      previous.setHours(0, 0, 0, 0);
                      previous.setDate(previous.getDate() - 1);
                      return previous;
                    })(),
                  }}
                  onHandle={handleAddTask}
                />
              )}
              <TaskList tasks={overdueTasks} />
            </SectionCard>
          )}

          {sortedGroups.map(([dateKey, tasksInGroup]) => (
            <SectionCard
              key={dateKey}
              title={getGroupDateLabel(tasksInGroup)}
              count={tasksInGroup.length}
              onPlusClick={() => handleIsAddTask(dateKey)}
            >
              {section && inbox && isAddTask[dateKey] && (
                <AddTask
                  isCreate={isAddTask[dateKey]}
                  setIsCreate={() => handleIsAddTask(dateKey)}
                  sectionId={section.id}
                  listId={inbox}
                  defaultConfirmRule={{ start_date: new Date(dateKey) }}
                  onHandle={handleAddTask}
                />
              )}
              <TaskList tasks={tasksInGroup.map((task) => task.id)} />
            </SectionCard>
          ))}
        </>
      )}
    </div>
  );
};

export default Page;
