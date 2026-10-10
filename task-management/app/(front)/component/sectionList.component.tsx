"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import AddSection from "./addSection.component";
import Section from "./section.component";
import { useChangePosition } from "../feature/hook/useListMutation.hook";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import {
  useCreateSection,
  useRemoveSection,
} from "../feature/hook/useSectionMutation.hook";
import { ISectionModelState } from "../model";
import { useWorkspaceStore } from "../states/workspace.state";
import ObjectID from "bson-objectid";
import { SectionCard } from "../components/sectionCard.component";
import AddTask from "../components/task/addTask";
import { TaskList } from "../components/task/taskList.component";
import { useShallow } from "zustand/react/shallow";
import { useTask } from "../feature/hook/task/task.hook";
import { useAddTask } from "../feature/hook/task/addTask.hook";

const SectionList = React.memo(
  ({
    listId,
    sections: sectionsData,
  }: {
    sections: string[];
    listId: string;
  }) => {
    const [sections, setSections] = useState<string[]>(sectionsData ?? []);
    const { mutate } = useChangePosition(listId);
    const { mutate: mutateRemoveSection } = useRemoveSection(listId);
    const { mutate: mutateAddSection } = useCreateSection(listId);
    const moveSection = useWorkspaceStore((state) => state.moveSection);
    const addSectionState = useWorkspaceStore((state) => state.addSection);
    const removeSectionStore = useWorkspaceStore(
      (state) => state.removeSection,
    );
    const tasks = useWorkspaceStore(
      useShallow((state) => state.listIndex[listId]?.tasks ?? []),
    );
    const {handleAddTask,isAddTask,setIsAddTask} =  useAddTask()
    useEffect(() => {
      setSections(sectionsData);
    }, [sectionsData]);

    const reorderSnapshotRef = useRef<string[] | null>(null);
    const removeSnapshotRef = useRef<string[] | null>(null);
    const changePosition = useCallback((startId: string, changeId: string) => {
      setSections((prev) => {
        const findStartIndex = prev.findIndex((section) => startId === section);
        const findEndIndex = prev.findIndex((section) => changeId === section);
        if (
          findStartIndex === -1 ||
          findEndIndex === -1 ||
          findStartIndex === findEndIndex
        ) {
          return prev;
        }

        reorderSnapshotRef.current ??= prev;

        const result = [...prev];
        const [removed] = result.splice(findStartIndex, 1);
        result.splice(findEndIndex, 0, removed);
        return result;
      });
    }, []);

    const saveOrderPosition = useCallback(
      (startId: string, changeId: string) => {
        moveSection(startId, changeId);
        mutate(
          { fromId: startId, toId: changeId },
          {
            onError: () => {
              if (reorderSnapshotRef.current) {
                setSections(reorderSnapshotRef.current);
              }
              toast.error("Đổi vị trí thất bại, đã khôi phục lại");
            },
            onSuccess: () => {
              toast.success("Đổi vị trí thành công");
            },
            onSettled: () => {
              reorderSnapshotRef.current = null;
            },
          },
        );
      },
      [mutate],
    );

    const removeSection = useCallback(
      (sectionId: string) => {
        removeSnapshotRef.current = sections;
        const fnRemove = setTimeout(() => {
          mutateRemoveSection(sectionId, {
            onSuccess: () => {
              toast.success("Xóa thành phần thành công");
              removeSectionStore(sectionId);
            },
            onError: () => {
              if (removeSnapshotRef.current) {
                setSections(removeSnapshotRef.current);
              }
              toast.error("Không thể xóa thành phần này, vui lòng thử lại");
            },
          });
        }, 1000);

        setSections((prev) => prev.filter((section) => section !== sectionId));
        toast.success("Xóa thành công", {
          description: (
            <div>
              <p>Danh sách section đã được cập nhật</p>
              <div
                className={`w-full fixed bottom-0 h-1 left-0 bg-primary animate-bar-processing`}
                style={{
                  animationDuration: `2000ms`,
                }}
              ></div>
            </div>
          ),
          duration: 2000,
          icon: <CheckCircle className="h-4 w-4" />,
          className: "my-custom-toast",
          action: {
            label: "Hoàn tác",
            onClick: () => {
              clearTimeout(fnRemove);
              if (removeSnapshotRef.current) {
                setSections(removeSnapshotRef.current);
              }
            },
          },
        });
      },
      [mutateRemoveSection],
    );

    const addSection = useCallback(
      (section: Pick<ISectionModelState, "name">) => {
        const sectionIdTemp = new ObjectID().toString();
        const sectionTemp: ISectionModelState = {
          id: sectionIdTemp,
          list: listId,
          name: section.name,
          tasks: [],
        };
        const snapShotSection = sections;
        setSections((prev) => [...prev, sectionTemp.id]);
        addSectionState(listId, sectionTemp);
        mutateAddSection(
          {
            id: sectionIdTemp,
            name: section.name,
          },
          {
            onError: () => {
              toast.error("Thêm thành phần thất bại, vui lòng thử lại");
              setSections(snapShotSection);
              removeSectionStore(sectionIdTemp);
            },
            onSuccess(data, variables, onMutateResult, context) {
              toast.success("Thêm thành phần thành công");
            },
          },
        );
      },
      [mutateAddSection],
    );

    return (
      <div className="flex gap-3 py-3 h-fit">
        {sections.length == 0 || tasks.length > 0 &&  (
          <SectionCard
            count={0}
            onPlusClick={()=>setIsAddTask(true)}
            title="Không có thành phần"
          >
            {listId && isAddTask && (
              <AddTask
                isCreate={isAddTask}
                setIsCreate={setIsAddTask}
                sectionId={undefined}
                listId={listId}
                onHandle={handleAddTask}
              />
            )}
            <TaskList tasks={tasks} />
          </SectionCard>
        )}

        {sections?.map((section) => (
          <Section
            key={section}
            removeSection={removeSection}
            listId={listId}
            sectionId={section}
            savePosition={saveOrderPosition}
            changePosition={changePosition}
          />
        ))}

        <AddSection listId={listId} handleAddSection={addSection} />
      </div>
    );
  },
);

export default SectionList;
