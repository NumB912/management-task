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

import { Calendar1, CalendarArrowUp, Inbox, Plus, Repeat } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import TagCombobox from "@/app/(front)/components/tagCompobox";
import PriorityDropdown from "@/app/(front)/components/piorityCombobox";
import CalendarComponent from "@/app/(front)/components/calendar/calendar.component";
import ListPicker from "@/app/(front)/components/listCombobox";

import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";

import { IRuleModel, ITaskModel } from "@/app/(front)/model";

import { IStatus } from "@/app/(front)/model/type/type";

import { formatDate } from "@/app/(front)/utils/getDayOfMonth.utils";
import { formatTimer } from "@/app/(front)/utils/formatTimer";
import { DialogDescription } from "@/app/(front)/components/ui/dialog";
import useTaskHook from "@/app/(front)/feature/hook/task/task.hook";
import { toast } from "sonner";
import { TaskCheckbox } from "@/app/(front)/components/task/taskCard";
import { getNextOccurrence } from "@/app/(front)/utils/caculateNextDay";
import Link from "next/link";
import ColorPicker from "@/app/(front)/components/color/colorPicker.component";

interface PageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default function TaskPage({ params }: Readonly<PageProps>) {
  const { taskId } = use(params);
  const router = useRouter();
  const {
    addTaskStore,
    changeIdTask,
    moveTaskIntoSection,
    removeTaskStore,
    task,
    updateRule,
    updateStatusApi,
    isTemp,
    updateTask,
    updateTaskStore,
  } = useTaskHook(taskId);
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
  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [color, setColor] = useState<string>(task.rule.color!);
  const [status, setStatus] = useState<IStatus>("pending");
  const [openTags, setOpenTags] = useState(false);
  const [openPriority, setOpenPriority] = useState(false);
  useEffect(() => {
    if (!task) return;
    setName(task.name ?? "");
    setTags(task.rule?.tags ?? []);
    setStatus(task.status);
  }, [
    taskId,
    task?.name,
    task?.status,
    task?.rule?.priority,
    task?.rule?.tags,
    task.list,
    task.section,
    list,
    section,
  ]);
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
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
    updateTaskStore(taskId, {
      name: newName,
    });

    updateTask(
      {
        taskId,
        data: {
          name: newName,
        },
      },
      {
        onError() {
          updateTaskStore(taskId, {
            name: previousName,
          });
          setName(previousName ?? "");
        },
      },
    );
  };

  useEffect(() => {
    if (!status) return;
    if (status == task.status) return;
    const timeOut = setTimeout(() => {
      updateTask({
        taskId: taskId,
        data: {
          status: status,
        },
      });
    }, 1000);
    return () => {
      clearTimeout(timeOut);
    };
  }, [status, task]);
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
  useEffect(()=>{
    if(!color) return 
    const handle = setTimeout(()=>{
      const prevRule = task.rule
      updateTaskStore(taskId,{
        rule:{
          ...task.rule,
          color:color
        }
      })
      updateRule({
        taskId:taskId,
        data:{
          color:color
        }
      },{
        onSuccess(data, variables, onMutateResult, context) {
          
        },
        onError(error, variables, onMutateResult, context) {
          updateTaskStore(taskId,{
            rule:prevRule
          })
        },
      })
    },1000)
    return ()=>{
      clearTimeout(handle)
    }
  },[color])

  const handleUpdateRule = (id: string, data: Partial<IRuleModel>) => {
    const prev = task;
    const {id:ruleId,...rest} = data
    console.log(rest)
    if (!prev || isTemp(id)) return;
    updateTaskStore(id, { rule: { ...prev.rule, ...data } });
    updateRule(
      { taskId: id, data:{
        ...rest,
      } },
      {
        onSuccess: () => {},
        onError: () => {
          updateTaskStore(id, { rule: prev.rule });
          toast.error("Không thể cập nhật lịch/ưu tiên");
        },
      },
    );
  };
  const handleUpdateTask = (id: string, data: Partial<ITaskModel>) => {
    const prev = task;
    if (!prev || isTemp(id)) return;

    const { section, ...rest } = data;
    const isMoving = !!section && section !== prev.section;
    const restKeys = Object.keys(rest) as (keyof ITaskModel)[];
    if (isMoving) moveTaskIntoSection(id, section!);
    if (restKeys.length) updateTaskStore(id, rest);

    updateTask(
      { taskId: id, data },
      {
        onSuccess: () => {},
        onError: () => {
          if (isMoving) moveTaskIntoSection(id, prev.section);
          if (restKeys.length) {
            updateTaskStore(
              id,
              Object.fromEntries(restKeys.map((k) => [k, prev[k]])),
            );
          }
          toast.error("Không thể cập nhật task");
        },
      },
    );
  };

  const handleUpdateStatusTask = (id: string, status: IStatus) => {
    const prev = task;
    if (!prev || isTemp(id)) return;
    const nextDate = getNextOccurrence(prev);
    const tempId = `temp-task-${crypto.randomUUID()}`;
    if (nextDate && tempId) {
      addTaskStore({
        ...prev,
        id: tempId,
        status,
        rule: { ...prev.rule, repeat: { mode: "none" } },
      });
      updateTaskStore(id, {
        status: "pending",
        rule: { ...prev.rule, start_date: nextDate },
      });
    } else {
      updateTaskStore(id, { status });
    }

    updateStatusApi(
      { taskId: id, data: { status } },
      {
        onSuccess(data, variables, onMutateResult, context) {
          changeIdTask(tempId, data.id);
        },
        onError: () => {
          if (tempId) removeTaskStore(tempId);
          updateTaskStore(id, { status: prev.status, rule: prev.rule });
          toast.error("Không thể cập nhật trạng thái");
        },
      },
    );
  };

  const onConfirmTags = (newTags: string[]) => {
    if (!task) return;
    setOpenTags(false);
    handleUpdateRule(taskId, {
      tags: newTags,
    });
  };

  const onSelectPriority = (newPriority: number) => {
    if (!task) return;
    handleUpdateRule(task.id, {
      priority: newPriority as 1 | 2 | 3 | 4,
    });
  };

  if (!task) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent
        className="
          gap-0 sm:max-w-4xl sm:max-h-4xl p-0 m-0
          rounded-sm
          max-w-lvh
        "
      >
        <DialogHeader className="p-3 border-b">
          <DialogTitle>
            <button
              type="button"
              className="flex gap-2 text-neutral-500 items-center text-sm"
            >
              <Inbox className="w-4 h-4" />
              {listIndex[task.list]?.name.toLocaleLowerCase() === "inbox"
                ? "Hộp thư"
                : listIndex[task.list]?.name}
            </button>
          </DialogTitle>
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
              <TaskCheckbox
                status={task.status}
                priority={task?.rule?.priority ?? 4}
                onHandle={() => {
                  handleUpdateStatusTask(
                    task.id,
                    task.status !== "pending" ? "pending" : "done",
                  );
                }}
              />

              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="
                  flex-1
                  text-2xl!
                  font-semibold
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
                max-w-full
                min-h-24
                max-h-60
                overflow-y-auto
                overflow-x-hidden
                border-0
                bg-transparent!
                text-md
                resize-none!
                whitespace-pre-wrap
                wrap-break-word
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
              <span className="text-sm font-bold">Danh sách</span>

              <ListPicker
                selectedList={task.list}
                selectedSection={task.section}
                onSelect={({ list, section }) => {
                  handleUpdateTask(taskId, {
                    list: list,
                    section: section,
                  });
                }}
              />
            </div>

            <div className="grid gap-1.5">
              {task.rule && (
                <CalendarComponent
                  rule={task.rule}
                  onChangeSubmit={(
                    rule: Pick<
                      IRuleModel,
                      | "end_date"
                      | "repeat"
                      | "start_date"
                      | "timer"
                      | "endTimer"
                    >,
                  ) => {
                    handleUpdateRule(task.id, rule);
                  }}
                  trigger={
                    <div className="w-full flex flex-col gap-2">
                      <span className="text-sm font-bold">Ngày</span>

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
                        text-neutral-700!
                      "
                      >
                        {task.rule?.start_date ? (
                          <div className="flex gap-1.5 items-center">
                            <Calendar1 />

                            <p>{formatDate(task.rule.start_date)}</p>

                            {task.rule.repeat?.mode !== "none" && <Repeat />}

                            {task.rule.timer && (
                              <span>{formatTimer(task.rule.timer)}</span>
                            )}

                          {task.rule.endTimer && (
                              <span>{formatTimer(task.rule.endTimer)}</span>
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
              )}
            </div>
            {task.rule?.end_date && (
              <div className="w-full flex flex-col gap-1.5">
                <span className="text-sm font-bold">Hạn chót</span>

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
                    text-neutral-700!
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
                <span className="text-sm font-bold">Độ ưu tiên</span>

                <PriorityDropdown
                  onSelectPriority={onSelectPriority}
                  priority={task.rule?.priority ?? 4}
                  align="center"
                  open={openPriority}
                  onOpenChange={setOpenPriority}
                />
              </div>
            </div>
            <div className="w-full flex flex-col gap-1.5">
              <span className="text-sm font-bold">Màu</span>
              <ColorPicker
                inline
                value={color}
                onChange={(value) => {
                  setColor(value);
                }}
              />
            </div>
            <div className="grid gap-1.5 min-h-15">
              <div className="flex w-full justify-between items-center">
                <span className="text-sm font-bold">Thẻ</span>
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
