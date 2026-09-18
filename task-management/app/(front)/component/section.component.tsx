import React, { useCallback, useEffect, useRef, useState } from "react";
import { TaskList } from "../components/task/taskList.component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ICreateTaskModel, ISectionModel, ISectionModelState } from "../model";
import {
  Card,
  CardContent,
  CardHeader,

} from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import AddTask from "../components/task/addTask";
import {
  useUpdateSection,
} from "../feature/hook/useSectionMutation.hook";
import { useWorkspace } from "../feature/hook/useWorkSpaceQuery.hook";
import { useWorkspaceStore } from "../states/workspace.state";
import { useShallow } from "zustand/react/shallow";

interface SectionProp {
  sectionId: string;
  listId: string;
  changePosition: (starts: string, change: string) => void;
  savePosition: (starts: string, change: string) => void;
  removeSection: (id: string) => void
}
const MAX_SECTION_NAME_LENGTH = 50;
const Section = React.memo(({ sectionId, changePosition, savePosition, listId, removeSection }: SectionProp) => {
  console.log("section")
  const [isCreateTask, setIsCreateTask] = useState<boolean>(false);
  const [isFocusInput, setIsFocusInput] = useState<boolean>(false);
  const [isOnDrag, setIsOnDrag] = useState<boolean>(false);
  const [isHover, setIsHover] = useState<boolean>(false);
  const offSetRef = useRef({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const inputWrapper = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTargetIdRef = useRef<string | null>(null);
  const [sectionName, setSectionName] = useState<string>("");
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [sectionNameError, setSectionNameError] = useState<string>("");
  const wasDraggingRef = useRef(false);
  const { mutate: mutateUpdateSection } = useUpdateSection(listId);
  const taskIds = useWorkspaceStore(
    useShallow((state) => state.sectionIndex[sectionId]?.tasks ?? [])
  );
  const sectionNameFromStore = useWorkspaceStore(
    (state) => state.sectionIndex[sectionId]?.name
  );
  const sectionExists = useWorkspaceStore(
    (state) => !!state.sectionIndex[sectionId]
  );

  const taskCount = taskIds.length;
  useEffect(() => {
    if (sectionNameFromStore !== undefined) {
      setSectionName(sectionNameFromStore);
    }
  }, [sectionId, sectionNameFromStore]);

  useEffect(() => {
    if (isFocusInput) {
      inputRef.current?.focus();
    }
  }, [isFocusInput]);

  useEffect(() => {
    function clickOutSide(e: MouseEvent) {
      if (
        inputWrapper.current &&
        !inputWrapper.current.contains(e.target as Node) &&
        isFocusInput
      ) {
        setIsFocusInput(false);
        setSectionNameError("");
        setSectionName(sectionNameFromStore ?? "");
      }
    }
    addEventListener("mousedown", clickOutSide);
    return () => removeEventListener("mousedown", clickOutSide);
  }, [isFocusInput, sectionNameFromStore]);

  const eventKeydown = useCallback((e: React.KeyboardEvent<HTMLInputElement>)=>{
    if (e.key == "Enter") {
      handleEditSection();
    } else if (e.key == "Escape") {
      setIsFocusInput(false);
      setSectionName(sectionNameFromStore ?? "");
      setSectionNameError("");
    }
  },[])

  const handleEditSection=useCallback(()=>{
    const trimmed = sectionName.trim();
    if (!trimmed) {
      setSectionNameError("Tên phần không được để trống");
      return;
    }
    if (trimmed.length > MAX_SECTION_NAME_LENGTH) {
      setSectionNameError(`Tên phần không quá ${MAX_SECTION_NAME_LENGTH} ký tự`);
      return;
    }
    setSectionNameError("");
    if (trimmed === sectionNameFromStore) {
      setIsFocusInput(false);
      return;
    }
    const previousName = sectionName;
    setSectionName(trimmed);
    setIsFocusInput(false);
    mutateUpdateSection(
      { id: sectionId, name: trimmed },
      {
        onError: (error) => {
          setSectionName(previousName);
          setSectionNameError(error instanceof Error ? error.message : "Cập nhật thất bại");
          setIsFocusInput(true);
        },
      },
    );
  },[])

  const updatePosition = useCallback((clientX: number, clientY: number)=>{
    if (!sectionRef.current) return;
    const x = clientX - offSetRef.current.x;
    const y = clientY - offSetRef.current.y;
    sectionRef.current.style.top = `${y}px`;
    sectionRef.current.style.left = `${x}px`;
  },[])

  const MouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>)=>{
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const { x, y } = e.currentTarget.getBoundingClientRect();

    dragTimeoutRef.current = setTimeout(() => {
      offSetRef.current = { x: startX - x, y: startY - y };
      if (sectionRef.current) {
        sectionRef.current.style.position = "fixed";
        sectionRef.current.style.top = `${y}px`;
        sectionRef.current.style.left = `${x}px`;
        sectionRef.current.style.zIndex = "999";
      }
      setIsOnDrag(true);
      wasDraggingRef.current = true;
    }, 300);
  },[])

  const endDrag = useCallback(()=>{
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (sectionRef.current) {
      sectionRef.current.style.position = "";
      sectionRef.current.style.top = "";
      sectionRef.current.style.left = "";
      sectionRef.current.style.zIndex = "";
    }
    if (isHover && lastTargetIdRef.current) {
      savePosition(sectionId, lastTargetIdRef.current);
    }
    lastTargetIdRef.current = null;
    setIsOnDrag(false);
    setIsHover(false);
    setIsFocusInput(false);
  },[sectionId,savePosition,lastTargetIdRef.current])

  useEffect(() => {
    if (!isOnDrag) return;

    function handleMouseMove(e: MouseEvent) {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updatePosition(e.clientX, e.clientY);
        const prevPointerEvents = sectionRef.current!.style.pointerEvents;
        sectionRef.current!.style.pointerEvents = "none";
        const aboveElement = document.elementFromPoint(e.clientX, e.clientY);
        sectionRef.current!.style.pointerEvents = prevPointerEvents;
        const closetElement = aboveElement?.closest("[data-section]");
        if (closetElement) {
          const targetId = closetElement.getAttribute("data-section");
          setIsHover(true);
          if (targetId) {
            lastTargetIdRef.current = targetId;
            changePosition(sectionId, targetId);
          }
        }
      });
    }
    function handleMouseUp() {
      endDrag();
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isOnDrag, isHover, sectionId]);
  if (!sectionExists) return null;

  return (
    <div className={isOnDrag ? "max-w-[min(40vw,500px)] min-w-65 bg-gray-100 rounded-md" : ""}>
      <Card ref={sectionRef} data-section={sectionId} className={cn("ring-0 rounded-0 gap-2 p-2")}>
        <CardHeader
          className="font-bold flex text-md gap-1 justify-between z-50 px-1"
          onMouseDown={MouseDown}
          onMouseUp={() => {
            if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
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
                  value={sectionName}
                  maxLength={MAX_SECTION_NAME_LENGTH}
                  onChange={(e) => {
                    setSectionName(e.target.value);
                    if (sectionNameError) setSectionNameError("");
                  }}
                  defaultValue={""}
                  onKeyDown={eventKeydown}
                  className={cn(
                    "text-md text-neutral-700 bg-transparent focus:outline-none! outline-none! border-b transition-colors",
                    sectionNameError ? "border-destructive!" : "border-transparent! focus:border-gray-400",
                  )}
                />
                {sectionNameError && <span className="text-xs text-destructive">{sectionNameError}</span>}
              </div>
            ) : (
              <>
                <Button
                  className={cn("flex gap-1 items-center text-start rounded-md font-bold")}
                  variant={"ghost"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (wasDraggingRef.current) {
                      wasDraggingRef.current = false;
                      return;
                    }
                    setIsFocusInput(true);
                  }}
                >
                  <span className="whitespace-nowrap text-ellipsis overflow-hidden max-w-50 min-w-0">
                    {sectionName}
                  </span>
                  <span className="text-neutral-400 font-normal shrink-0">{taskCount}</span>
                </Button>

                <div className="flex">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreateTask(!isCreateTask);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="rounded hover:bg-gray-200 p-1 text-neutral-600 cursor-pointer relative bg-transparent"
                  >
                    <Plus />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="rounded hover:bg-gray-200 p-1 text-neutral-600 cursor-pointer relative bg-transparent"
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className="flex gap-2" onClick={() => setIsFocusInput(true)}>
                        <Edit /> Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex gap-2" onClick={() => removeSection(sectionId)}>
                        <Trash /> Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className={cn(
          "p-0! gap-0.5 flex flex-col items-center",
          "overflow-x-hidden overflow-y-auto",
          "max-h-[min(50vh,500px)] min-w-65! w-full"
        )}>
          {
            isCreateTask&& <AddTask isCreate={isCreateTask} setIsCreate={setIsCreateTask} sectionId={sectionId} listId={listId} />
          }
          <TaskList tasks={taskIds ?? []} />
        </CardContent>
      </Card>
    </div>
  );
});

export default Section;
