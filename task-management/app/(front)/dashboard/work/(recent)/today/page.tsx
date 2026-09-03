"use client";
import { SectionCard } from "@/app/(front)/components/sectionCard.component";
import AddTask from "@/app/(front)/components/task/addTask";
import { TaskList } from "@/app/(front)/components/task/taskList.component";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/app/(front)/components/ui/card";
import { useToday } from "@/app/(front)/feature/hook/useToday.hook";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { cn } from "@/lib/utils";
import { Button } from "@base-ui/react";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";

const Page = () => {
  const { setTitle } = useHeader();
  const { data } = useToday();
  const [isCreateTask, setIsCreateTask] = useState(false);
  const [isCreateTaskOverDue, setIsCreateTaskOverDue] = useState(false)

  const { inbox, listTaskInfo } = useWorkspaceStore();
  const [section, setSection] = useState<{ id: string }>();

  useEffect(() => {
    setTitle("Hôm nay");
  }, []);

  useEffect(() => {
    const firstSection = inbox ? listTaskInfo[inbox]?.list?.sections?.[0] : undefined;
    if (firstSection) {
      setSection({ id: firstSection.id });
    }
  }, [inbox, listTaskInfo]);

  return (
    
    <div className="flex gap-3 py-3 ">
      {data?.overDue && data?.overDue.length > 0 && (
    <SectionCard count={data.overDue.length} onPlusClick={() => {
                    setIsCreateTaskOverDue(!isCreateTaskOverDue)
                }} title="Quá hạn">
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
                        })()
                      }}
                    />
                  )}
                  <TaskList tasks={data.overDue} />
                </SectionCard>
      )}

     <SectionCard
              title={"Hôm nay"}
              count={data?.today.length??0}
              onPlusClick={() => setIsCreateTask(!isCreateTask)}
            >
              {section && inbox && (
                <AddTask
                  isCreate={isCreateTask}
                  setIsCreate={() => setIsCreateTask(!isCreateTask)}
                  sectionId={section.id}
                  listId={inbox}
                  defaultConfirmRule={{ start_date: new Date() }}
                />
              )}
              <TaskList tasks={data?.today??[]} />
            </SectionCard>
    </div>
  );
};

export default Page;