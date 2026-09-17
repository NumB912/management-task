"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import AddSection from "./addSection.component";
import Section from "./section.component";
import { ISectionModel } from "../model";
import { useChangePosition } from "../feature/hook/useListMutation.hook";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import { useCreateSection, useRemoveSection } from "../feature/hook/useSectionMutation.hook";

const SectionList = (DTO: { sections: ISectionModel[]; listId: string }) => {
  const { listId } = DTO;
  const [sections, setSections] = useState<ISectionModel[]>(DTO.sections ?? []);
  const { mutate } = useChangePosition(listId);
  const { mutate: mutateRemoveSection } = useRemoveSection(listId);
  const { mutate: mutateAddSection } = useCreateSection(listId)
  const [isDrop, setIsDrop] = useState<boolean>(false);
  useEffect(() => {
    setSections(DTO.sections);
  }, [DTO.sections]);
  const reorderSnapshotRef = useRef<ISectionModel[] | null>(null);
  const removeSnapshotRef = useRef<ISectionModel[] | null>(null);

  const changePosition = useCallback((startId: string, changeId: string) => {
    setSections((prev) => {
      const findStartIndex = prev.findIndex(
        (section) => startId === section.id,
      );
      const findEndIndex = prev.findIndex((section) => changeId === section.id);
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
          },
          onError: () => {
            if (removeSnapshotRef.current) {
              setSections(removeSnapshotRef.current);
            }
            toast.error("Không thể xóa thành phần này, vui lòng thử lại");
          },
        });
      }, 3000);

      setSections((prev) => prev.filter((section) => section.id !== sectionId));
      toast.success("Xóa thành công", {
        description: (
          <div>
            <p>Danh sách section đã được cập nhật</p>
            <div
              className={`w-full fixed bottom-0 h-1 left-0 bg-primary animate-bar-processing`}
              style={{
                animationDuration: `3000ms`,
              }}
            ></div>
          </div>
        ),
        duration: 3000,
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
    [sections, mutateRemoveSection],
  );

  function addSection(section: Pick<ISectionModel, "name">) {
    mutateAddSection(section, {
      onError: () => {
        toast.error("Thêm thành phần thất bại, vui lòng thử lại")
      },
      onSuccess: () => {
        toast.success("Thêm thành phần thành công")
      }
    })
  }

  return (
    <div className="flex gap-3 py-3">
      {sections?.map((section) => (
        <Section
          key={section.id}
          removeSection={removeSection}
          setIsDrop={setIsDrop}
          listId={listId}
          section={section}
          savePosition={saveOrderPosition}
          changePosition={changePosition}
        />
      ))}

      <AddSection
        listId={listId}
        handleAddSection={addSection}
      />
    </div>
  );
};

export default SectionList;
