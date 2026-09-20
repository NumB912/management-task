"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Calendar1, CalendarArrowUp, Plus, Repeat } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import TagCombobox from "@/app/(front)/components/tagCompobox";
import PriorityDropdown from "@/app/(front)/components/piorityCombobox";
import CalendarComponent from "@/app/(front)/components/calendar/calendar.component";
import ListPicker from "@/app/(front)/components/listCombobox";

import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";

import {
  IListModel,
  IListModelState,
  IRuleModel,
  ISectionModel,
  ISectionModelState,
} from "@/app/(front)/model";

import { IStatus } from "@/app/(front)/model/type/type";

import { formatDate } from "@/app/(front)/utils/getDayOfMonth.utils";
import { formatTimer } from "@/app/(front)/utils/formatTimer";

import {
  useUpdateTask,
  useUpdateTaskStatus,
} from "@/app/(front)/feature/hook/useTaskMutation.hook";

import { cn } from "@/lib/utils";
import { DialogDescription } from "@/app/(front)/components/ui/dialog";

interface PageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default function TaskPage({ params }: Readonly<PageProps>) {
  const { taskId } = use(params);
  const router = useRouter();
  const task = useWorkspaceStore((state) => state.taskIndex[taskId]);
  const updateTask = useWorkspaceStore((state) => state.updateTask);
  const listIndex = useWorkspaceStore((state) => state.listIndex);
  const sectionIndex = useWorkspaceStore((state) => state.sectionIndex);
  const list = useMemo(() => {
    if (!task) return undefined;
    return listIndex[task.list];
  }, [listIndex, task]);
  const section = useMemo(() => {
    if (!task || !list) return undefined;
    return sectionIndex[task.section];
  }, [task]);
  const listOptions = useMemo(() => {
    return Object.values(listIndex);
  }, [listIndex]);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<number>(4);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<IStatus>("pending");
  const [openTags, setOpenTags] = useState(false);
  const [openPriority, setOpenPriority] = useState(false);
  const [confirmList, setConfirmList] = useState<
    Pick<IListModel, "id" | "name"> | undefined
  >();

  const [confirmSection, setConfirmSection] = useState<
    ISectionModelState | undefined
  >();
  const { mutate: updateTaskAPI } = useUpdateTask(task?.list ?? "");
  const { mutate: updateStatusAPI } = useUpdateTaskStatus();
  useEffect(() => {
    if (!task) return;
    setName(task.name ?? "");
    setPriority(task.rule?.priority ?? 4);
    setTags(task.rule?.tags ?? []);
    setStatus(task.status);
    setConfirmList(list);
    setConfirmSection(section);
  }, [
    taskId,
    task?.name,
    task?.status,
    task?.rule?.priority,
    task?.rule?.tags,
    list,
    section,
  ]);
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };
  const handleToggleComplete = () => {
    if (!task) return;
    const nextStatus: IStatus = status === "done" ? "pending" : "done";
    setStatus(nextStatus);
    //   {
    //     taskId,
    //     data: {
    //       status: nextStatus,
    //     },
    //   },
    //   {
    //     onError() {
    //       setStatus(previousStatus);
    //       updateTask(taskId, {
    //         status: previousStatus,
    //       });
    //     },
    //   }
    // );
  };

  const handleNameBlur = () => {
    if (!task) return;

    const newName = name.trim();

    if (!newName) {
      setName(task.name ?? "");
      return;
    }

    if (newName === task.name) {
      return;
    }

    const previousName = task.name;

    // Optimistic Zustand
    updateTask(taskId, {
      name: newName,
    });

    updateTaskAPI(
      {
        taskId,
        data: {
          name: newName,
        },
      },
      {
        onError() {
          updateTask(taskId, {
            name: previousName,
          });

          setName(previousName ?? "");
        },
      },
    );
  };

  useEffect(() => {

    if(!status) return
    if(status==task.status) return

    const timeOut = setTimeout(()=>{
      updateTask(taskId,{
        status:status
      })
    },1000)


    return ()=>{
      clearTimeout(timeOut)
    }
  }, [status,task]);

  useEffect(() => {
    if (!task) return;

    const currentName = name.trim();

    if (!currentName) return;

    if (currentName === task.name) {
      return;
    }

    const timeout = setTimeout(() => {
      handleNameBlur();
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [name, task?.name]);
  const onConfirmTags = (newTags: string[]) => {
    if (!task) return;
    setOpenTags(false);
    setTags(newTags);
    updateTask(taskId, {
      rule: {
        ...task.rule,
        tags: newTags,
      },
    });
  };
  const onSelectPriority = (newPriority: number) => {
    if (!task) return;
    setPriority(newPriority);
    updateTask(taskId, {
      rule: {
        ...task.rule,
        priority: newPriority as 1 | 2 | 3 | 4,
      },
    });
  };
  const handleCalendarChange = (
    rule: Pick<IRuleModel, "end_date" | "repeat" | "start_date" | "timer">,
  ) => {
    if (!task) return;

    updateTask(taskId, {
      rule: {
        ...task.rule,
        ...rule,
      },
    });
  };

  if (!task) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent
        className="
          blur-none
          gap-0
          sm:max-w-4xl
          sm:max-h-4xl
          p-0
          m-0
          rounded-sm
          max-w-lvh
        "
      >
        <DialogHeader className="p-3 border-b">
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex h-full min-h-140">
          <div
            className="
              flex-1
              flex
              flex-col
              h-full
              max-h-140
              overflow-y-auto
              gap-4
              p-5
            "
          >
            <div className="flex items-center justify-start gap-3">
              <Checkbox
                checked={status === "done"}
                onCheckedChange={handleToggleComplete}
                className={cn(
                  "size-7 shrink-0 rounded-full border cursor-pointer",
                  "border-neutral-300",
                  "data-[state=checked]:bg-primary",
                  "data-[state=checked]:border-primary",
                  "data-[state=checked]:text-white",
                )}
              />

              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="
                  flex-1
                  text-2xl!
                  font-medium
                  outline-none!
                  border-0
                  bg-transparent!
                  focus:outline-0!
                  placeholder:text-neutral-300
                "
                placeholder="Tên công việc"
              />
            </div>
            <div className="w-full">
              <Textarea
                placeholder="Nhập chi tiết"
                rows={4}
                className="
                  pl-10
                  w-full
                  min-h-0
                  border-0
                  bg-transparent!
                  text-md
                  resize-none
                  focus-visible:ring-0
                  focus-visible:ring-offset-0
                "
              />
            </div>
          </div>
          <div
            className="
              max-w-70
              w-full
              flex
              flex-col
              gap-3
              p-5
              bg-primary/5
            "
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Danh sách</span>

              <ListPicker
                lists={
                  listOptions as unknown as Pick<
                    IListModelState,
                    "id" | "name" | "sections"
                  >[]
                }
                selectedList={confirmList}
                selectedSection={confirmSection}
                onSelect={({ list, section }) => {
                  setConfirmList(list);
                  if (!section) {
                    setConfirmSection(undefined);
                    return;
                  }

                  setConfirmSection({
                    id: section.id ?? "",
                    name: section.name ?? "",
                    list: section.list ?? "",
                    order: section.order ?? 0,
                    tasks: section.tasks?.map((task) => task.id) ?? [],
                  });
                }}
              />
            </div>

            <div className="grid gap-1.5">
              <CalendarComponent
                rule={task.rule}
                onChangeSubmit={handleCalendarChange}
                trigger={
                  <div className="w-full flex flex-col gap-2">
                    <span className="text-sm font-medium">Ngày</span>

                    <Button
                      variant="outline"
                      className="
                        flex
                        w-full
                        p-1.5!
                        cursor-pointer
                        justify-start
                        text-sm
                        rounded-sm
                        bg-transparent!
                        hover:bg-transparent!
                      "
                    >
                      {task.rule.start_date ? (
                        <div className="flex gap-1.5 items-center">
                          <Calendar1 />

                          <p>{formatDate(task.rule.start_date)}</p>

                          {task.rule.repeat?.mode !== "none" && <Repeat />}

                          {task.rule.timer && (
                            <span>{formatTimer(task.rule.timer)}</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Plus className="w-2 h-2" />

                          <span className="text-sm">Thêm ngày</span>
                        </div>
                      )}
                    </Button>
                  </div>
                }
              />
            </div>
            {task.rule.end_date && (
              <div className="w-full flex flex-col gap-1.5">
                <span className="text-sm font-medium">Hạn chót</span>

                <Button
                  variant="outline"
                  className="
                    flex
                    p-1.5!
                    w-full
                    cursor-pointer
                    justify-start
                    text-sm
                    rounded-sm
                    bg-transparent!
                    hover:bg-transparent!
                  "
                >
                  <div className="flex gap-2 items-center">
                    <CalendarArrowUp />

                    <p>{formatDate(task.rule.end_date)}</p>
                  </div>
                </Button>
              </div>
            )}
            <div className="min-w-35">
              <div className="grid gap-1.5">
                <span className="text-sm font-medium">Độ ưu tiên</span>

                <PriorityDropdown
                  onSelectPriority={onSelectPriority}
                  priority={priority}
                  align="center"
                  open={openPriority}
                  onOpenChange={setOpenPriority}
                />
              </div>
            </div>

            {/* ============================================= */}
            {/* TAGS */}
            {/* ============================================= */}

            <div className="grid gap-1.5 min-h-15">
              <div className="flex w-full justify-between items-center">
                <span className="text-sm font-medium">Thẻ</span>

                <Button
                  variant="ghost"
                  className="w-fit h-fit"
                  onClick={() => setOpenTags(true)}
                >
                  <Plus className="w-4! h-4!" />
                </Button>
              </div>

              <TagCombobox
                selectedTags={tags}
                onConfirm={onConfirmTags}
                trigger={
                  <div className="flex flex-wrap gap-1.5">
                    {tags.length === 0 ? (
                      <div
                        className="
                          flex
                          items-center
                          justify-center
                          w-full
                          p-1
                          rounded
                          text-neutral-500
                        "
                      >
                        Không có thẻ được thêm vào
                      </div>
                    ) : (
                      <>
                        {tags.slice(0, 4).map((tag) => (
                          <Badge
                            key={tag}
                            variant="ghost"
                            className="
                                text-xs
                                outline-1
                                outline-neutral-300
                                text-black
                              "
                          >
                            {tag}
                          </Badge>
                        ))}

                        {tags.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{tags.length - 4}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                }
                onCreateTag={() => {}}
                onOpenChange={setOpenTags}
                open={openTags}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
