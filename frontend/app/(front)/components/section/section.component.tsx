import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "../../feature/store/workspace.state";
import { useShallow } from "zustand/react/shallow";
import { useUpdateSection } from "../../feature/hook/useSectionMutation.hook";
import { useAddTask } from "../../feature/hook/task/addTask.hook";
import { Card, CardContent, CardHeader } from "../ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import { scrollDragAncestors } from "../../utils/dragAutoScroll";
import AddTask from "../task/addTask";
import { TaskList } from "../task/taskList.component";


interface SectionProp {
  sectionId: string;
  listId: string;
  changePosition: (starts: string, change: string) => void;
  savePosition: (starts: string, change: string) => void;
  cancelPosition: () => void;
  removeSection: (id: string) => void;
}
const MAX_SECTION_NAME_LENGTH = 50;

const Section = ({
  sectionId,
  changePosition,
  savePosition,
  cancelPosition,
  listId,
  removeSection,
}: SectionProp) => {
  const [isFocusInput, setIsFocusInput] = useState<boolean>(false);
  const [isOnDrag, setIsOnDrag] = useState<boolean>(false);

  const offSetRef = useRef({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const inputWrapper = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTargetIdRef = useRef<string | null>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wasDraggingRef = useRef(false);
  const activePointerRef = useRef<{
    id: number;
    startX: number;
    startY: number;
    clientX: number;
    clientY: number;
    handle: HTMLElement;
    dragging: boolean;
  } | null>(null);
  const [draftName, setDraftName] = useState<string>("");
  const [sectionNameError, setSectionNameError] = useState<string>("");
  const section = useWorkspaceStore(
    useShallow((state) => state.sectionIndex[sectionId]),
  );
  const updateSection = useWorkspaceStore((state) => state.setSectionIndex);
  const { mutate: mutateUpdateSection } = useUpdateSection(listId);
  const taskIds = useWorkspaceStore(
    useShallow((state) => state.sectionIndex[sectionId]?.tasks ?? []),
  );
  const {handleAddTask,isAddTask,setIsAddTask} = useAddTask();
  const sectionExists = useWorkspaceStore(
    (state) => !!state.sectionIndex[sectionId],
  );
  const taskCount = taskIds.length;
  useEffect(() => {
    if (isFocusInput) {
      inputRef.current?.focus();
    }
  }, [isFocusInput]);

  const startEdit = useCallback(() => {
    setDraftName(section.name??"");
    setSectionNameError("");
    setIsFocusInput(true);
  }, [section]);

  const cancelEdit = useCallback(() => {
    setIsFocusInput(false);
    setSectionNameError("");
  }, []);

  useEffect(() => {
    function clickOutSide(e: PointerEvent) {
      if (
        inputWrapper.current &&
        !inputWrapper.current.contains(e.target as Node) &&
        isFocusInput
      ) {
        cancelEdit();
      }
    }
    addEventListener("pointerdown", clickOutSide);
    return () => removeEventListener("pointerdown", clickOutSide);
  }, [isFocusInput, cancelEdit]);

  const handleEditSection = useCallback(() => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setSectionNameError("Tên phần không được để trống");
      return;
    }
    if (trimmed.length > MAX_SECTION_NAME_LENGTH) {
      setSectionNameError(
        `Tên phần không quá ${MAX_SECTION_NAME_LENGTH} ký tự`,
      );
      return;
    }
    if (trimmed === section.name) {
      cancelEdit();
      return;
    }

    const previousName = section.name;
    setSectionNameError("");
    setIsFocusInput(false);
    updateSection(sectionId, { name: trimmed });

    mutateUpdateSection(
      { id: sectionId, name: trimmed },
      {
        onError: (error) => {
          const current =
            useWorkspaceStore.getState().sectionIndex[sectionId]?.name;
          if (current === trimmed) {
            updateSection(sectionId, { name: previousName });
          }
          setDraftName(trimmed);
          setSectionNameError(
            error instanceof Error ? error.message : "Cập nhật thất bại",
          );
          setIsFocusInput(true);
        },
      },
    );
  }, [
    draftName,
    section,
    sectionId,
    updateSection,
    mutateUpdateSection,
    cancelEdit,
  ]);

  const eventKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleEditSection();
      } else if (e.key === "Escape") {
        cancelEdit();
      }
    },
    [handleEditSection, cancelEdit],
  );

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!sectionRef.current) return;
    const x = clientX - offSetRef.current.x;
    const y = clientY - offSetRef.current.y;
    sectionRef.current.style.top = `${y}px`;
    sectionRef.current.style.left = `${x}px`;
  }, []);

  const endDrag = useCallback(() => {
    const pointer = activePointerRef.current;
    activePointerRef.current = null;
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (pointer?.handle.hasPointerCapture(pointer.id)) {
      pointer.handle.releasePointerCapture(pointer.id);
    }
    if (sectionRef.current) {
      sectionRef.current.style.position = "";
      sectionRef.current.style.top = "";
      sectionRef.current.style.left = "";
      sectionRef.current.style.width = "";
      sectionRef.current.style.zIndex = "";
    }
    lastTargetIdRef.current = null;
    if (pointer?.dragging) cancelPosition();
    setIsOnDrag(false);
  }, [cancelPosition]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary || e.button !== 0 || activePointerRef.current) return;
    if ((e.target as HTMLElement).closest("input, textarea, [contenteditable=true], [data-no-section-drag]")) return;
    if (!sectionRef.current) return;
    e.stopPropagation();
    wasDraggingRef.current = false;
    const pointer = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      clientX: e.clientX,
      clientY: e.clientY,
      // Capture on the stable board: section nodes move during reorder previews.
      handle: e.currentTarget.closest<HTMLElement>("[data-section-board]") ?? document.documentElement,
      dragging: false,
    };
    activePointerRef.current = pointer;

    dragTimeoutRef.current = setTimeout(() => {
      dragTimeoutRef.current = null;
      const card = sectionRef.current;
      if (!card || activePointerRef.current !== pointer) return;
      const { x, y, width } = card.getBoundingClientRect();
      offSetRef.current = { x: pointer.startX - x, y: pointer.startY - y };
      card.style.position = "fixed";
      card.style.top = y + "px";
      card.style.left = x + "px";
      card.style.width = width + "px";
      card.style.zIndex = "999";
      pointer.dragging = true;
      pointer.handle.setPointerCapture(pointer.id);
      wasDraggingRef.current = true;
      setIsOnDrag(true);
    }, 300);
  }, []);

  useEffect(() => {
    function moveSection(clientX: number, clientY: number) {
      const card = sectionRef.current;
      if (!card) return;
      updatePosition(clientX, clientY);
      const previous = card.style.pointerEvents;
      card.style.pointerEvents = "none";
      const aboveElement = document.elementFromPoint(clientX, clientY);
      card.style.pointerEvents = previous;
      const targetId = (aboveElement?.closest("[data-section], [data-section-slot]")?.getAttribute("data-section") ?? aboveElement?.closest("[data-section-slot]")?.getAttribute("data-section-slot"));
      if (targetId === sectionId) return;
      if (targetId && targetId !== lastTargetIdRef.current) {
        changePosition(sectionId, targetId);
      }
      lastTargetIdRef.current = targetId ?? null;
    }

    function handlePointerMove(e: PointerEvent) {
      const pointer = activePointerRef.current;
      if (!pointer || e.pointerId !== pointer.id) return;
      if (!pointer.dragging) {
        if (Math.hypot(e.clientX - pointer.startX, e.clientY - pointer.startY) > 8) {
          endDrag();
        }
        return;
      }
      e.preventDefault();
      pointer.clientX = e.clientX;
      pointer.clientY = e.clientY;
    }
    function handlePointerUp(e: PointerEvent) {
      const pointer = activePointerRef.current;
      if (!pointer || e.pointerId !== pointer.id) return;
      if (pointer.dragging) moveSection(e.clientX, e.clientY);
      const targetId = lastTargetIdRef.current;
      if (pointer.dragging && targetId) {
        savePosition(sectionId, targetId);
        pointer.dragging = false;
      }
      endDrag();
    }
    function handlePointerCancel(e: PointerEvent) {
      if (e.pointerId === activePointerRef.current?.id) endDrag();
    }

    function handleCaptureLost(e: PointerEvent) {
      const pointer = activePointerRef.current;
      // Touch starts with implicit capture on a child. Its release while
      // transferring capture to the board must not cancel this drag.
      if (pointer && e.pointerId === pointer.id && e.target === pointer.handle &&
        !pointer.handle.hasPointerCapture(pointer.id)) {
        endDrag();
      }
    }

    let previousTime = performance.now();
    function animateDrag(time: number) {
      const pointer = activePointerRef.current;
      if (!pointer?.dragging) return;
      scrollDragAncestors(sectionRef.current?.parentElement ?? null,
        pointer.clientX, pointer.clientY, time - previousTime);
      previousTime = time;
      moveSection(pointer.clientX, pointer.clientY);
      rafRef.current = requestAnimationFrame(animateDrag);
    }


    if (isOnDrag) rafRef.current = requestAnimationFrame(animateDrag);
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("lostpointercapture", handleCaptureLost);
    window.addEventListener("blur", endDrag);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("lostpointercapture", handleCaptureLost);
      window.removeEventListener("blur", endDrag);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isOnDrag, sectionId, endDrag, changePosition, savePosition, updatePosition]);

  useEffect(() => () => {
    if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const pointer = activePointerRef.current;
    activePointerRef.current = null;
    if (pointer?.handle.hasPointerCapture(pointer.id)) {
      pointer.handle.releasePointerCapture(pointer.id);
    }
  }, []);

  if (!sectionExists) return null;

  return (
    <div
      data-section-slot={sectionId}
      className={
        isOnDrag
          ? "max-w-[min(40vw,500px)] min-w-65 bg-gray-100 rounded-md"
          : ""
      }
    >
      <Card
        ref={sectionRef}
        data-section={sectionId}
        className={cn("ring-0 rounded-0 gap-2 p-2")}
      >
        <CardHeader
          className="font-bold flex text-md gap-1 justify-between z-50 px-1 touch-none select-none"
          onPointerDown={handlePointerDown}
          onContextMenu={(e) => { if (activePointerRef.current) e.preventDefault(); }}
          onClickCapture={(e) => {
            if (wasDraggingRef.current) {
              wasDraggingRef.current = false;
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          ref={inputWrapper}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="wrapper z-30 flex justify-between w-full gap-1">
            {isFocusInput ? (
              <div className="flex flex-col gap-0.5 w-full">
                <Input
                  ref={inputRef}
                  placeholder="Phần mới"
                  value={draftName}
                  maxLength={MAX_SECTION_NAME_LENGTH}
                  onChange={(e) => {
                    setDraftName(e.target.value);
                    if (sectionNameError) setSectionNameError("");
                  }}
                  onKeyDown={eventKeydown}
                  className={cn(
                    "text-md text-neutral-700 bg-transparent focus:outline-none! outline-none! border-b transition-colors",
                    sectionNameError
                      ? "border-destructive!"
                      : "border-transparent! focus:border-gray-400",
                  )}
                />
                {sectionNameError && (
                  <span className="text-xs text-destructive">
                    {sectionNameError}
                  </span>
                )}
              </div>
            ) : (
              <>
                <Button
                  className={cn(
                    "flex gap-1 items-center text-start rounded-md font-bold",
                  )}
                  variant={"ghost"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (wasDraggingRef.current) {
                      wasDraggingRef.current = false;
                      return;
                    }
                    startEdit();
                  }}
                >
                  <span className="whitespace-nowrap text-ellipsis overflow-hidden max-w-50 min-w-0">
                    {section.name}
                  </span>
                  <span className="text-neutral-400 font-normal shrink-0">
                    {taskCount}
                  </span>
                </Button>

                <div className="flex">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddTask(!isAddTask)
                    }}
                    data-no-section-drag
                    onPointerDown={(e) => e.stopPropagation()}
                    className="rounded hover:bg-gray-200 p-1 text-neutral-600 cursor-pointer relative bg-transparent"
                  >
                    <Plus />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        onClick={(e) => e.stopPropagation()}
                        data-no-section-drag
                        onPointerDown={(e) => e.stopPropagation()}
                        className="rounded hover:bg-gray-200 p-1 text-neutral-600 cursor-pointer relative bg-transparent"
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="flex gap-2"
                        onClick={startEdit}
                      >
                        <Edit /> Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex gap-2"
                        onClick={() => removeSection(sectionId)}
                      >
                        <Trash /> Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent
          className={cn(
            "p-0! gap-0.5 flex flex-col items-center",
            "overflow-x-hidden overflow-y-auto",
            "max-h-[min(65vh,600px)]! max-w-[min(40vw,500px)] min-w-65! h-full w-full",
          )}
        >
          {isAddTask && (
            <AddTask
              isCreate={isAddTask}
              setIsCreate={setIsAddTask}
              sectionId={sectionId}
              listId={listId}
              onHandle={handleAddTask}
            />
          )}
          <TaskList
            tasks={taskIds ?? []}
            className="flex-1 min-h-0 max-h-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};
export default Section;