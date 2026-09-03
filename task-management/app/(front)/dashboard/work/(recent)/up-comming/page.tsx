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
import { useUpComming } from "@/app/(front)/feature/hook/useToday.hook";
import { ITaskModel } from "@/app/(front)/model";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";

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

const getGroupUpComming = (tasks: ITaskModel[]): Record<string, ITaskModel[]> => {
  const groups: Record<string, ITaskModel[]> = {};
  tasks.forEach((task) => {
    const rawDate = task.rule?.start_date;
    if (!rawDate) return;
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
  const { data } = useUpComming();
  const [upComming, setUpComming] = useState<Record<string, ITaskModel[]> | null>(null);
  const [isCreateTask, setIsCreateTask] = useState(false);
  const [isAddTask, setIsAddTask] = useState<Record<string, boolean>>({})
  const { inbox, listTaskInfo } = useWorkspaceStore();
  const [isAddPreviousTask,setAddPreviousTask] = useState<boolean>(false)
  const [section, setSection] = useState<{ id: string }>();
  useEffect(() => {
    const firstSection = inbox ? listTaskInfo[inbox]?.list?.sections?.[0] : undefined;
    if (firstSection) {
      setSection({ id: firstSection.id });
    }
  }, [inbox, listTaskInfo]);

  useEffect(() => {
    setTitle("Sắp tới");
  }, []);

  useEffect(() => {
    if (!data?.upComming) return;
    setUpComming(getGroupUpComming(data.upComming));
  }, [data]);

  const handleIsAddTask = (id: string) => {
    setIsAddTask((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  const sortedGroups = upComming
    ? Object.entries(upComming).sort(
      ([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime(),
    )
    : [];

  const hasNothingToShow = sortedGroups.length === 0 && (!data?.overDue || data?.overDue.length === 0);
  return (
    <div className="flex gap-3 py-3">
      {
        hasNothingToShow ? (
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
              <CardContent className={cn("p-0! overflow-auto overflow-y-auto gap-0.5 flex flex-col items-center cursor-grab",
                "max-h-[min(60vh,500px)] w-full min-w-[40vh]",
                "sm:max-h-[min(70vh,700px)] sm:max-w-lg!",
                "lg:max-h-[min(79vh,900px)] lg:max-w-md!")}>    {section && inbox && (
                  <AddTask
                    isCreate={isCreateTask}
                    setIsCreate={setIsCreateTask}
                    sectionId={section.id}
                    listId={inbox}
                    defaultConfirmRule={{
                      start_date: new Date()
                    }}
                  />
                )}
              </CardContent>
            </Card></div>) : <>
          {data?.overDue && data?.overDue.length > 0 && (
            <SectionCard count={data.overDue.length} onPlusClick={() => {
                setAddPreviousTask(!isAddPreviousTask)
            }} title="Quá hạn">
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
                    })()
                  }}
                />
              )}
              <TaskList tasks={data.overDue} />
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
                />
              )}
              <TaskList tasks={tasksInGroup} />
            </SectionCard>
          ))}</>
      }

    </div>
  );
};

export default Page;