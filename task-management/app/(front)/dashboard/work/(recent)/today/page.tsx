"use client";
import { SectionCard } from "@/app/(front)/components/sectionCard.component";
import AddTask from "@/app/(front)/components/task/addTask";
import { TaskList } from "@/app/(front)/components/task/taskList.component";
import { useAddTask } from "@/app/(front)/feature/hook/task/addTask.hook";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import React, { useEffect, useState } from "react";

const Page = () => {
  const { setTitle } = useHeader();
  const [isCreateTask, setIsCreateTask] = useState<boolean>(false);
  const [isCreateTaskOverDue, setIsCreateTaskOverDue] = useState(false);
  const { inbox } = useWorkspaceStore();
  const getOverdueTasks = useWorkspaceStore((state) => state.getOverdueTasks);
  const getTodayInfo = useWorkspaceStore((state) => state.getTodayInfo);
  const addTaskHandle = useAddTask()

  const taskOverDue = getOverdueTasks();
  const taskToday = getTodayInfo();
  useEffect(() => {
    setTitle("Hôm nay");
  }, []);
  return (
    <div className="flex gap-3 py-3 ">
      {getOverdueTasks() && getOverdueTasks().length > 0 && (
        <SectionCard
          count={getOverdueTasks().length}
          onPlusClick={() => {
            setIsCreateTaskOverDue(!isCreateTaskOverDue);
          }}
          title="Quá hạn"
        >
          {inbox && (
            <AddTask
              isCreate={isCreateTaskOverDue}
              setIsCreate={setIsCreateTaskOverDue}
              sectionId={undefined}
              listId={inbox}
              onHandle={addTaskHandle}
              defaultConfirmRule={{
                start_date: (() => {
                  const previous = new Date();
                  previous.setHours(0, 0, 0, 0);
                  previous.setDate(previous.getDate() - 1);
                  return previous;
                })(),
              }}
            />
          )}
          <TaskList tasks={taskOverDue} />
        </SectionCard>
      )}

      <SectionCard
        title={"Hôm nay"}
        count={getTodayInfo()?.length ?? 0}
        onPlusClick={() => setIsCreateTask(!isCreateTask)}
      >
        {inbox && isCreateTask && (
          <AddTask
            isCreate={isCreateTask}
            setIsCreate={() => setIsCreateTask(!isCreateTask)}
            sectionId={undefined}
            listId={inbox}
            onHandle={addTaskHandle}
            defaultConfirmRule={{ start_date: new Date() }}
          />
        )}
        <TaskList tasks={taskToday ?? []} />
      </SectionCard>
    </div>
  );
};

export default Page;
