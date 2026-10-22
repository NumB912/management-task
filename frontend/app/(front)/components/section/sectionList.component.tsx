"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useChangePosition } from "../../feature/hook/useListMutation.hook";
import {
  useCreateSection,
  useRemoveSection,
} from "../../feature/hook/useSectionMutation.hook";
import { useWorkspaceStore } from "../../feature/store/workspace.state";
import { useShallow } from "zustand/react/shallow";
import { useAddTask } from "../../feature/hook/task/addTask.hook";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import { ISectionModelState } from "../../model";
import { SectionCard } from "../sectionCard.component";
import AddTask from "../task/addTask";
import { TaskList } from "../task/taskList.component";
import { previewSectionOrder, getSectionDropTarget } from "../../utils/sectionReorder";
import Section from "./section.component";
import AddSection from "./addSection.component";
import ObjectID from "bson-objectid";
import { DEFAULT_COLORS } from "../../model/mod/color.config";

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
    const { handleAddTask, isAddTask, setIsAddTask } = useAddTask();
    useEffect(() => {
      setSections(sectionsData);
    }, [sectionsData]);


    const reorderSnapshotRef = useRef<string[] | null>(null);
    const previewOrderRef = useRef<string[]>(sections);
    const removeSnapshotRef = useRef<string[] | null>(null);
    useEffect(() => {
      if (!reorderSnapshotRef.current) previewOrderRef.current = sections;
    }, [sections]);

    const cancelOrderPosition = useCallback(() => {
      const original = reorderSnapshotRef.current;
      if (original) {
        previewOrderRef.current = original;
        setSections(original);
      }
      reorderSnapshotRef.current = null;
    }, []);

    const changePosition = useCallback((startId: string, changeId: string) => {
      const current = previewOrderRef.current;
      const next = previewSectionOrder(current, startId, changeId);
      if (next === current) return;
      reorderSnapshotRef.current ??= current;
      previewOrderRef.current = next;
      setSections(next);
    }, []);

    const saveOrderPosition = useCallback(
      (startId: string) => {
        const original = reorderSnapshotRef.current;
        if (!original) return;
        const targetId = getSectionDropTarget(original, previewOrderRef.current, startId);
        reorderSnapshotRef.current = null;
        if (!targetId) return;
        moveSection(startId, targetId);
        mutate(
          { fromId: startId, toId: targetId },
          {
            onError: () => {
              previewOrderRef.current = original;
              setSections(original);
              const state = useWorkspaceStore.getState();
              const list = state.listIndex[listId];
              if (list) useWorkspaceStore.setState({
                listIndex: { ...state.listIndex, [listId]: { ...list, sections: original } },
              });
              toast.error("Đổi vị trí thất bại, đã khôi phục lại");
            },
            onSuccess: () => {
              toast.success("Đổi vị trí thành công");
            },
          },
        );
      },
      [listId, moveSection, mutate],
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
      [mutateRemoveSection, removeSectionStore, sections],
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
            onSuccess() {
              toast.success("Thêm thành phần thành công");
            },
          },
        );
      },
      [addSectionState, listId, mutateAddSection, removeSectionStore, sections],
    );

    

    return (
      <div data-section-board className="flex gap-3 py-3 h-fit">
        {sections.length == 0 ||
          (tasks.length > 0 && (
            <SectionCard
              count={0}
              onPlusClick={() => setIsAddTask(true)}
              title="Không có thành phần"
            >
              {listId && isAddTask && (
                <AddTask
                  isCreate={isAddTask}
                  setIsCreate={setIsAddTask}
                  sectionId={undefined}
                  listId={listId}
                  onHandle={handleAddTask}
                  defaultConfirmTask={{
                    color:DEFAULT_COLORS[0],
                    rule:{
                      repeat:{
                        mode:"none"
                      }
                    }
                  }}
                />
              )}
              <TaskList tasks={tasks} />
            </SectionCard>
          ))}

        {sections?.map((section) => (
          <Section
            key={section}
            removeSection={removeSection}
            listId={listId}
            sectionId={section}
            cancelPosition={cancelOrderPosition}
            savePosition={saveOrderPosition}
            changePosition={changePosition}
          />
        ))}

        <AddSection listId={listId} handleAddSection={addSection} />
      </div>
    );
  },
);

SectionList.displayName = "SectionList";

export default SectionList;
