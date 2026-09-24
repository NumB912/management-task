"use client";

import React, { memo, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronLeft } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Task } from "./taskCard";
import { useWorkspaceStore } from "../../states/workspace.state";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

interface TaskSectionProp {
  tasks: string[];
  className?:string;
}

const COMPLETED_PREVIEW = 10;

type VirtualTaskItem =
  | { type: "task"; id: string }
  | { type: "completed-header"; id: "completed-header" }
  | { type: "toggle-more"; id: "toggle-more" };

export const TaskList = memo(({ tasks,className="" }: TaskSectionProp) => {
  const [openSeeMore, setOpenSeeMore] = useState(false);
  const [openCollapsible, setOpenCollapsible] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);

  const taskData = useWorkspaceStore(
    useShallow((state) =>
      tasks
        .map((taskId) => state.taskIndex[taskId])
        .filter((task): task is NonNullable<typeof task> => Boolean(task))
    )
  );

  const pendingIds = useMemo(
    () => taskData.filter((t) => t.status === "pending").map((t) => t.id),
    [taskData]
  );

  const completedIds = useMemo(
    () => taskData.filter((t) => t.status !== "pending").map((t) => t.id),
    [taskData]
  );

  const hasMore = completedIds.length > COMPLETED_PREVIEW;
  const hiddenCount = completedIds.length - COMPLETED_PREVIEW;

  const virtualItemsData = useMemo<VirtualTaskItem[]>(() => {
    const items: VirtualTaskItem[] = [];

    for (const id of pendingIds) {
      items.push({ type: "task", id });
    }

    if (completedIds.length > 0) {
      items.push({ type: "completed-header", id: "completed-header" });

      if (openCollapsible) {
        const shown = openSeeMore
          ? completedIds
          : completedIds.slice(0, COMPLETED_PREVIEW);

        for (const id of shown) {
          items.push({ type: "task", id });
        }

        if (hasMore) {
          items.push({ type: "toggle-more", id: "toggle-more" });
        }
      }
    }

    return items;
  }, [pendingIds, completedIds, openCollapsible, openSeeMore, hasMore]);

const virtualizer = useVirtualizer({
  count: virtualItemsData.length,
  getScrollElement: () => parentRef.current,
  getItemKey: (index) => virtualItemsData[index]?.id ?? index, 
  estimateSize: (index) => {
    const type = virtualItemsData[index]?.type;
    return type === "completed-header" || type === "toggle-more" ? 40 : 56;
  },
  overscan: 5,
});

  const virtualItems = virtualizer.getVirtualItems();

  if (pendingIds.length === 0 && completedIds.length === 0) {
    return null;
  }

  return (
    <div ref={parentRef} className={cn("w-full max-h-150 overflow-y-auto overflow-x-hidden",className)}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = virtualItemsData[virtualItem.index];
          if (!item) return null;

          const style = { transform: `translateY(${virtualItem.start}px)` };
          const wrapperClass = "absolute left-0 top-0 w-full";

          if (item.type === "completed-header") {
            return (
              <div
                key={item.id}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className={wrapperClass}
                style={style}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpenCollapsible((prev) => !prev);
                    setOpenSeeMore(false);
                  }}
                  className="w-full text-xs font-bold p-2 flex gap-2 items-center"
                >
                  <ChevronLeft
                    className={`w-4 h-4 transition-transform ${
                      openCollapsible ? "-rotate-90" : ""
                    }`}
                  />
                  <span className="flex items-center gap-1">
                    Hoàn thành/Không làm
                    <span className="text-neutral-400 font-normal shrink-0">
                      {completedIds.length}
                    </span>
                  </span>
                </button>
              </div>
            );
          }

          if (item.type === "toggle-more") {
            return (
              <div
                key={item.id}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className={wrapperClass}
                style={style}
              >
                <div className="flex justify-center py-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-neutral-500"
                    onClick={() => setOpenSeeMore((prev) => !prev)}
                  >
                    {openSeeMore ? "Thu gọn" : `Xem thêm (${hiddenCount})`}
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className={wrapperClass}
              style={style}
            >
              <div className="items-center bg-white w-full mt-2 rounded-md border border-gray-200 shadow">
                <Task taskId={item.id} depth={0} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});