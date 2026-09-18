"use client";
import { SectionCard } from "@/app/(front)/components/sectionCard.component";
import AddTask from "@/app/(front)/components/task/addTask";
import { TaskList } from "@/app/(front)/components/task/taskList.component";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import React, { useEffect, useState } from "react";

const Page = () => {
  const { setTitle } = useHeader();
  const [isCreateTask, setIsCreateTask] = useState<boolean>(false);
  const [isCreateTaskOverDue, setIsCreateTaskOverDue] = useState(false);
  const { inbox, listIndex, getOverdueTasks, getTodayInfo } =
    useWorkspaceStore();
    console.log("hello")
  const [section, setSection] = useState<{ id: string }>();
  useEffect(() => {
    setTitle("Hôm nay");
  }, []);

  useEffect(() => {
    const firstSection = inbox
      ? listIndex[inbox]?.sections?.[0]
      : undefined;
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
          <TaskList tasks={getOverdueTasks()} />
        </SectionCard>
      )}

      <SectionCard
        title={"Hôm nay"}
        count={getTodayInfo()?.length ?? 0}
        onPlusClick={() => setIsCreateTask(!isCreateTask)}
      >
        {section && inbox && isCreateTask (
          <AddTask
            isCreate={isCreateTask}
            setIsCreate={() => setIsCreateTask(!isCreateTask)}
            sectionId={section.id}
            listId={inbox}
            defaultConfirmRule={{ start_date: new Date() }}
          />
        )}
        <TaskList tasks={getTodayInfo() ?? []} />
      </SectionCard>
    </div>
  );
};

export default Page;
