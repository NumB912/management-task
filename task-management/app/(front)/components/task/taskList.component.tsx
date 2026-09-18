"use client";

import React, {
  memo,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useVirtualizer,
} from "@tanstack/react-virtual";

import {
  ChevronLeft,
} from "lucide-react";

import { Task } from "./taskCard";

import {
  useWorkspaceStore,
} from "../../states/workspace.state";
import { useShallow } from "zustand/react/shallow";

interface TaskSectionProp {
  tasks: string[];
}

type VirtualTaskItem =
  | {
    type: "task";
    id: string;
  }
  | {
    type: "completed-header";
    id: "completed-header";
  };

export const TaskList = memo(
  ({ tasks }: TaskSectionProp) => {
    const [openCollapsible, setOpenCollapsible] =
      useState(true);

    /**
     * =========================================================
     * SCROLL CONTAINER
     * =========================================================
     */
    const parentRef =
      useRef<HTMLDivElement>(null);

    /**
     * =========================================================
     * Lấy task từ Zustand
     *
     * Không lấy toàn bộ taskIndex:
     *
     * ❌ const taskIndex = useWorkspaceStore(
     *      state => state.taskIndex
     *    )
     *
     * Vì update bất kỳ task nào cũng làm TaskList render.
     * =========================================================
     */
    const taskData = useWorkspaceStore(
      useShallow((state) =>
        tasks
          .map(
            (taskId) =>
              state.taskIndex[taskId]
          )
          .filter(
            (
              task
            ): task is NonNullable<typeof task> =>
              Boolean(task)
          ))
    );

    /**
     * =========================================================
     * PENDING
     * =========================================================
     */
    const pendingIds = useMemo(() => {
      return taskData
        .filter(
          (task) =>
            task.status === "pending"
        )
        .map(
          (task) => task.id
        );
    }, [taskData]);

    /**
     * =========================================================
     * COMPLETED / WON'T DO
     * =========================================================
     */
    const completedIds = useMemo(() => {
      return taskData
        .filter(
          (task) =>
            task.status !== "pending"
        )
        .map(
          (task) => task.id
        );
    }, [taskData]);

    /**
     * =========================================================
     * Tạo 1 danh sách phẳng cho Virtualizer
     *
     * Ví dụ:
     *
     * pendingIds:
     * ["p1", "p2", "p3"]
     *
     * completedIds:
     * ["c1", "c2", "c3"]
     *
     * =>
     *
     * [
     *   { type: "task", id: "p1" },
     *   { type: "task", id: "p2" },
     *   { type: "task", id: "p3" },
     *
     *   { type: "completed-header" },
     *
     *   { type: "task", id: "c1" },
     *   { type: "task", id: "c2" },
     *   { type: "task", id: "c3" }
     * ]
     *
     * Nếu đóng completed:
     *
     * [
     *   p1,
     *   p2,
     *   p3,
     *   completed-header
     * ]
     * =========================================================
     */
    const virtualItemsData =
      useMemo<VirtualTaskItem[]>(() => {
        const items: VirtualTaskItem[] = [];
        for (const id of pendingIds) {
          items.push({
            type: "task",
            id,
          });
        }

        if (completedIds.length > 0) {
          items.push({
            type: "completed-header",
            id: "completed-header",
          });

          if (openCollapsible) {
            for (const id of completedIds) {
              items.push({
                type: "task",
                id,
              });
            }
          }
        }

        return items;
      }, [
        pendingIds,
        completedIds,
        openCollapsible,
      ]);

    /**
     * =========================================================
     * VIRTUALIZER
     * =========================================================
     */
    const virtualizer =
      useVirtualizer({
        count:
          virtualItemsData.length,

        getScrollElement: () =>
          parentRef.current,
        estimateSize: (index) => {
          const item =
            virtualItemsData[index];

          /**
           * Header nhỏ hơn Task
           */
          if (
            item?.type ===
            "completed-header"
          ) {
            return 40;
          }

          return 56;
        },
        overscan: 5,
      });
    const virtualItems =
      virtualizer.getVirtualItems();
    if (
      pendingIds.length === 0 &&
      completedIds.length === 0
    ) {
      return null;
    }

    return (
      <div
        ref={parentRef}
        className="
          w-full
          max-h-150
          overflow-y-auto
          overflow-x-hidden
        "
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map(
            (virtualItem) => {
              const item =
                virtualItemsData[
                virtualItem.index
                ];

              if (!item) {
                return null;
              }
              if (
                item.type ===
                "completed-header"
              ) {
                return (
                  <div
                    key={item.id}
                    data-index={
                      virtualItem.index
                    }
                    ref={
                      virtualizer.measureElement
                    }
                    className="
                      absolute
                      left-0
                      top-0
                      w-full
                    "
                    style={{
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenCollapsible(
                          (prev) =>
                            !prev
                        )
                      }
                      className="
                        w-full
                        text-xs
                        font-bold
                        p-2
                        flex
                        gap-2
                        items-center
                      "
                    >
                      <ChevronLeft
                        className={`
                          w-4
                          h-4
                          transition-transform
                          ${openCollapsible
                            ? "-rotate-90"
                            : ""
                          }
                        `}
                      />

                      <span className="flex items-center gap-1">
                        Hoàn thành/Không làm

                        <span
                          className="
                            text-neutral-400
                            font-normal
                            shrink-0
                          "
                        >
                          {
                            completedIds.length
                          }
                        </span>
                      </span>
                    </button>
                  </div>
                );
              }
              return (
                <div
                  key={item.id}
                  data-index={
                    virtualItem.index
                  }
                  ref={
                    virtualizer.measureElement
                  }
                  className="
                    absolute
                    left-0
                    top-0
                    w-full
                    px-0
                  "
                  style={{
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div
                    className="
                      flex
                      gap-2
                      items-center
                      bg-white
                      w-full
                      mt-2
                      rounded-md
                      border
                      border-gray-200
                      shadow
                    "
                  >
                    <Task
                      taskId={item.id}
                      depth={0}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    );
  }
);

