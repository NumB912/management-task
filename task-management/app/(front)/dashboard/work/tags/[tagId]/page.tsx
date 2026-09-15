"use client";
import { SectionCard } from "@/app/(front)/components/sectionCard.component";
import AddTask from "@/app/(front)/components/task/addTask";
import { TaskList } from "@/app/(front)/components/task/taskList.component";
import { useTag } from "@/app/(front)/feature/hook/tagQuery.hook";
import { ITaskModel } from "@/app/(front)/model";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { useEffect, use, useState, useMemo } from "react";

interface IListTaskGroup {
  list: { id: string; name: string };
  tasks: ITaskModel[];
}

const Page = ({ params }: { params: Promise<{ tagId: string }> }) => {
  const { tagId } = use(params);
  const { setTitle } = useHeader();
  const { data } = useTag(tagId);
  const [isAddTask, setIsAddTask] = useState<Record<string, boolean>>({});
  const [isAddTaskEmpty, setIsAddTaskEmpty] = useState(false);

  // Select riêng từng field/hàm, tránh subscribe cả store
  // (Select each field/function individually, avoid subscribing to the whole store)
  const getTaskTag = useWorkspaceStore((s) => s.getTaskTag);
  const inbox = useWorkspaceStore((s) => s.inbox);
  const listInfo = useWorkspaceStore((s) => s.listInfo);

  const tasks = useMemo(
    () => getTaskTag(data?.tag.name ? [data.tag.name] : []),
    [getTaskTag, data?.tag.name],
  );

  // Khôi phục logic group theo list — đã có sẵn, chỉ bị comment
  // (Restored the group-by-list logic — it already existed, just commented out)
  const groups = useMemo<IListTaskGroup[]>(() => {
    const map: Record<string, IListTaskGroup> = {};

    for (const task of tasks) {
      const listId = task.list;
      const listMeta = listInfo[listId]?.list;
      if (!listMeta) continue;

      if (!map[listId]) {
        map[listId] = { list: { id: listId, name: listMeta.name }, tasks: [] };
      }
      map[listId].tasks.push(task);
    }

    return Object.values(map);
  }, [tasks, listInfo]);

  const handleIsAddTask = (id: string) => {
    setIsAddTask((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (data?.tag) setTitle(data.tag.name);
  }, [data, setTitle]);

  if (!data || !data.tag) {
    return null;
  }

  const inboxSectionId = inbox ? listInfo[inbox]?.list?.sections?.[0]?.id : undefined;

  if (tasks.length === 0) {
    return (
      <div className="flex gap-3 h-full select-none">
        <SectionCard
          count={0}
          onPlusClick={() => setIsAddTaskEmpty((prev) => !prev)}
          title={inbox ? listInfo[inbox]?.list?.name ?? "Inbox" : "Inbox"}
        >
          {inboxSectionId && isAddTaskEmpty && (
            <AddTask
              isCreate={isAddTaskEmpty}
              setIsCreate={() => setIsAddTaskEmpty((prev) => !prev)}
              sectionId={inboxSectionId}
              listId={inbox!}
              defaultConfirmRule={{ tags: [data.tag.name] }}
            />
          )}
          <TaskList tasks={tasks} />
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="flex gap-3 h-full select-none">
      {groups.map((group) => {
        const firstSectionId = listInfo[group.list.id]?.list?.sections?.[0]?.id;

        return (
          <SectionCard
            key={group.list.id}
            count={group.tasks.length}
            onPlusClick={() => handleIsAddTask(group.list.id)}
            title={group.list.name}
          >
            {firstSectionId && isAddTask[group.list.id] && (
              <AddTask
                isCreate={isAddTask[group.list.id]}
                setIsCreate={() => handleIsAddTask(group.list.id)}
                sectionId={firstSectionId}
                listId={group.list.id}
                defaultConfirmRule={{ tags: [data.tag.name] }}
              />
            )}
            <TaskList tasks={group.tasks} />
          </SectionCard>
        );
      })}
    </div>
  );
};

export default Page;