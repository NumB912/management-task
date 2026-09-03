"use client";
import LineSection from "@/app/(front)/components/lineSection";
import { SectionCard } from "@/app/(front)/components/sectionCard.component";
import AddTask from "@/app/(front)/components/task/addTask";
import { TaskList } from "@/app/(front)/components/task/taskList.component";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/(front)/components/ui/card";
import { tagApi } from "@/app/(front)/feature/api/tags/tag.api";
import { useTag } from "@/app/(front)/feature/hook/tagQuery.hook";
import { ITaskModel } from "@/app/(front)/model";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, use, useState, useMemo } from "react";
interface IListTaskGroup {
  list: {
    id: string;
    name: string;
  };
  tasks: ITaskModel[];
}
const Page = ({ params }: { params: Promise<{ tagId: string }> }) => {
  const { tagId } = use(params);
  const { setTitle } = useHeader();
  const listInfo = useWorkspaceStore((state) => state.listTaskInfo)
  const { data } = useTag(tagId)
  const { inbox } = useWorkspaceStore()
  const [section, setSection] = useState<{ id: string }>();
  const [isAddTask, setIsAddTask] = useState<Record<string, boolean>>({})
  useEffect(() => {
    const firstSection = inbox ? listInfo[inbox]?.list?.sections?.[0] : undefined;
    if (firstSection) {
      setSection({ id: firstSection.id });
    }
  }, [inbox, listInfo]);

  const listTag: IListTaskGroup[] = useMemo(() => {
    if (!data?.tasks) return [];

    const groups: Record<string, IListTaskGroup> = {};

    for (const task of data.tasks) {
      const listId = task.list;
      const listMeta = listInfo[listId]?.list;
      if (!listMeta) continue;

      if (!groups[listId]) {
        groups[listId] = {
          list: { id: listId, name: listMeta.name },
          tasks: [],
        };
      }
      groups[listId].tasks.push(task);
    }

    return Object.values(groups);
  }, [data, listInfo]);
  const handleIsAddTask = (id: string) => {
    setIsAddTask((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }
  useEffect(() => {
    if (data?.tag) setTitle(data.tag.name);
  }, [data]);

  if (!data || !data.tag) {
    return
  }

  return (
    <div className="flex gap-3 h-full select-none">
      {listTag.map((listTag) => (
        <SectionCard key={listTag.list.id} count={listTag?.tasks.length ?? 0} onPlusClick={() => {handleIsAddTask(listTag.list.id)}} title={listTag.list.name} >
          {section && inbox && isAddTask[listTag.list.id] && (
            <AddTask
              isCreate={isAddTask[listTag.list.id]}
              setIsCreate={() => handleIsAddTask(listTag.list.id)}
              sectionId={section.id}
              listId={listTag.list.id}
              defaultConfirmRule={{ tags:[data.tag.name] }}
            />
          )}
          <TaskList tasks={listTag?.tasks ?? []} />
        </SectionCard>
      ))}
    </div>
  );
};

export default Page;
