"use client";
import { use, useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/app/(front)/components/sectionCard.component";
import AddTask from "@/app/(front)/components/task/addTask";
import { TaskList } from "@/app/(front)/components/task/taskList.component";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { useAddTask } from "@/app/(front)/feature/hook/task/addTask.hook";

interface TagGroup {
  listId: string;
  listName: string;
  taskIds: string[];
}

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

interface TagColumnProps {
  listId: string;
  listName: string;
  sectionId?: string;
  taskIds: string[];
  tagName: string;
}

function TagColumn({ listId, listName, sectionId, taskIds, tagName }: Readonly<TagColumnProps>) {
  const [isAdding, setIsAdding] = useState(false);
  const handleAddTask = useAddTask(listId)
  return (  
    <SectionCard
      count={taskIds.length}
      onPlusClick={() => setIsAdding((p) => !p)}
      title={listName}
    >
      {sectionId && isAdding && (
        <AddTask
          isCreate={isAdding}
          setIsCreate={setIsAdding}
          sectionId={sectionId}
          listId={listId}
          defaultConfirmRule={{ tags: [tagName] }}
          onHandle={(task) => {
            handleAddTask(task)
            setIsAdding(false);
          }}
        />
      )}
      <TaskList tasks={taskIds} />
    </SectionCard>
  );
}

const Page = ({ params }: { params: Promise<{ tagName: string }> }) => {
  const { tagName: rawTag } = use(params);
  const tagName = safeDecode(rawTag);
  const { setTitle } = useHeader();
  const inbox = useWorkspaceStore((s) => s.inbox);
  const listIndex = useWorkspaceStore((s) => s.listIndex);
  const taskIndex = useWorkspaceStore((s) => s.taskIndex);
  const tag = useWorkspaceStore((s) => s.tagIndex[tagName]);
  const displayName = tag?.name ?? tagName;
  useEffect(() => {
    setTitle(displayName);
  }, [displayName, setTitle]);

  const groups = useMemo<TagGroup[]>(() => {
    const key = tagName.toLowerCase();
    const map = new Map<string, TagGroup>();

    for (const task of Object.values(taskIndex)) {
      if (!task.rule?.tags?.some((t) => t.toLowerCase() === key)) continue;

      const list = listIndex[task.list];
      if (!list) continue;

      let group = map.get(task.list);
      if (!group) {
        group = {
          listId: list.id,
          listName: list.id === inbox ? "Hộp thư" : list.name,
          taskIds: [],
        };
        map.set(task.list, group);
      }
      group.taskIds.push(task.id);
    }

    return [...map.values()];
  }, [taskIndex, listIndex, tagName, inbox]);

  return (
    <div className="flex gap-3 h-full select-none overflow-x-auto">
      {groups.length > 0 ? (
        groups.map((g) => (
          <TagColumn
            key={g.listId}
            listId={g.listId}
            listName={g.listName}
            sectionId={listIndex[g.listId]?.sections?.[0]}
            taskIds={g.taskIds}
            tagName={displayName}
          />
        ))
      ) : inbox ? (
        <TagColumn
          listId={inbox}
          listName="Hộp thư"
          sectionId={listIndex[inbox]?.sections?.[0]}
          taskIds={[]}
          tagName={displayName}
        />
      ) : null}
    </div>
  );
};

export default Page;