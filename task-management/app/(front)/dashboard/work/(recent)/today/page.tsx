"use client";
import { SectionCard } from "@/app/(front)/components/sectionCard.component";
import AddTask from "@/app/(front)/components/task/addTask";
import { TaskList } from "@/app/(front)/components/task/taskList.component";
import { useAddTask } from "@/app/(front)/feature/hook/task/addTask.hook";
import { useCreateTask } from "@/app/(front)/feature/hook/useTaskMutation.hook";
import { ITaskModel } from "@/app/(front)/model";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import React, { useEffect, useMemo, useState } from "react";

const Page = () => {
  const { setTitle } = useHeader();
  const [isCreateTask, setIsCreateTask] = useState<boolean>(false);
  const [isCreateTaskOverDue, setIsCreateTaskOverDue] = useState(false);
  const { inbox, listIndex } = useWorkspaceStore();
  const getOverdueTasks = useWorkspaceStore((state) => state.getOverdueTasks);
  const getTodayInfo = useWorkspaceStore((state) => state.getTodayInfo);
  const changeIdTaskState = useWorkspaceStore((state) => state.changeIdTask);
  const addTaskState = useWorkspaceStore((state) => state.addTask);
  const { mutate: addTaskMutate } = useCreateTask(inbox!);
  const addTaskHandle = useAddTask(inbox??"")
  const [section, setSection] = useState<{ id: string }>();
  const taskOverDue = getOverdueTasks();
  const taskToday = getTodayInfo();
  useEffect(() => {
    setTitle("Hôm nay");
  }, []);

  useEffect(() => {
    const firstSection = inbox ? listIndex[inbox]?.sections?.[0] : undefined;
    if (firstSection) {
      setSection({ id: firstSection });
    }
  }, [inbox, listIndex]);
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
          {section && inbox && (
            <AddTask
              isCreate={isCreateTaskOverDue}
              setIsCreate={setIsCreateTaskOverDue}
              sectionId={section.id}
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
        {section && inbox && isCreateTask && (
          <AddTask
            isCreate={isCreateTask}
            setIsCreate={() => setIsCreateTask(!isCreateTask)}
            sectionId={section.id}
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
