"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
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
import ColorPicker from "@/app/(front)/components/color/colorPicker.component";
import { TaskCheckbox } from "@/app/(front)/components/task/taskCard";

import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { IRuleModel } from "@/app/(front)/model";
import { formatDate } from "@/app/(front)/utils/getDayOfMonth.utils";
import { formatTimer } from "@/app/(front)/utils/formatTimer";
import { useTask } from "@/app/(front)/feature/hook/task/task.hook";

interface PageProps {
  params: Promise<{ taskId: string }>;
}

export default function TaskPage({ params }: Readonly<PageProps>) {
  const { taskId } = use(params);
  const router = useRouter();

  const {
    task,
    handleUpdateTask,
    handleUpdateRule,
    handleUpdateTags,
    handleCreateTag,
    toggleStatus,
  } = useTask(taskId);

  const listIndex = useWorkspaceStore((s) => s.listIndex);
  const [name, setName] = useState(task?.name ?? "");
  const [color, setColor] = useState<string>(task?.rule?.color ?? "");
  const [openTags, setOpenTags] = useState(false);
  const [openPriority, setOpenPriority] = useState(false);
  const isEditingName = useRef(false);
  useEffect(() => {
    if (!task || isEditingName.current) return;
    setName(task.name ?? "");
  }, [taskId, task?.name]);
  useEffect(() => {
    setColor(task?.rule?.color ?? "");
  }, [taskId]);
  const commitName = () => {
    if (!task) return;
    const newName = name.trim();
    if (!newName) {
      setName(task.name ?? "");
      return;
    }
    if (newName === task.name) return;
    handleUpdateTask(taskId, { name: newName });
  };

  useEffect(() => {
    if (!task) return;
    const newName = name.trim();
    if (!newName || newName === task.name) return;
    const t = setTimeout(commitName, 1000);
    return () => clearTimeout(t);
  
  }, [name, task?.name]);
  useEffect(() => {
    if (!task || !color || color === task.rule?.color) return;
    const t = setTimeout(() => {
      handleUpdateRule(taskId, { color });
    }, 1000);
    return () => clearTimeout(t);
  }, [color]);

  const handleOpenChange = (open: boolean) => {
    if (!open) router.back();
  };

  if (!task) return null;

  const tags = task.rule?.tags ?? [];
  const listName = listIndex[task.list]?.name;

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 sm:max-w-4xl sm:max-h-4xl p-0 m-0 rounded-sm max-w-lvh">
        <DialogHeader className="p-3 border-b">
          <DialogTitle>
            <button
              type="button"
              className="flex gap-2 text-neutral-500 items-center text-sm"
            >
              <Inbox className="w-4 h-4" />
              {listName?.toLocaleLowerCase() === "inbox" ? "Hộp thư" : listName}
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full min-h-140">
          <div className="flex-1 flex flex-col h-full max-h-140 overflow-y-auto gap-4 p-5">
            <div className="flex items-center justify-start gap-3">
              <TaskCheckbox
                status={task.status}
                priority={task.rule?.priority ?? 4}
                onHandle={toggleStatus}
              />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => (isEditingName.current = true)}
                onBlur={() => {
                  isEditingName.current = false;
                  commitName();
                }}
                className="flex-1 text-2xl! font-semibold outline-none! border-0 bg-transparent! focus:outline-0! placeholder:text-neutral-300"
                placeholder="Tên công việc"
              />
            </div>
            <div className="w-full">
              <Textarea
                placeholder="Nhập chi tiết"
                rows={4}
                className="pl-10 w-full max-w-full min-h-24 max-h-60 overflow-y-auto overflow-x-hidden border-0 bg-transparent! text-md resize-none! whitespace-pre-wrap wrap-break-word focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="max-w-70 w-full flex flex-col gap-3 p-5 bg-primary/5">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-bold">Danh sách</span>
              <ListPicker
                selectedList={task.list}
                selectedSection={task.section}
                onSelect={({ list, section }) =>
                  handleUpdateTask(taskId, { list, section })
                }
              />
            </div>

            <div className="grid gap-1.5">
              {task.rule && (
                <CalendarComponent
                  rule={task.rule}
                  onChangeSubmit={(
                    rule: Pick<
                      IRuleModel,
                      "end_date" | "repeat" | "start_date" | "timer" | "endTimer"
                    >,
                  ) => handleUpdateRule(task.id, rule)}
                  trigger={
                    <div className="w-full flex flex-col gap-2">
                      <span className="text-sm font-bold">Ngày</span>
                      <Button
                        variant="outline"
                        className="flex w-full p-1.5! cursor-pointer justify-start text-sm rounded-sm bg-transparent! hover:bg-transparent! text-neutral-700!"
                      >
                        {task.rule.start_date ? (
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
                            <span className="text-sm">Thêm ngày</span>
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
                  className="flex p-1.5! w-full cursor-pointer justify-start text-sm rounded-sm bg-transparent! hover:bg-transparent! text-neutral-700!"
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
                  onSelectPriority={(p) =>
                    handleUpdateRule(task.id, { priority: p as 1 | 2 | 3 | 4 })
                  }
                  priority={task.rule?.priority ?? 4}
                  align="center"
                  open={openPriority}
                  onOpenChange={setOpenPriority}
                />
              </div>
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <span className="text-sm font-bold">Màu</span>
              <ColorPicker inline value={color} onChange={setColor} />
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
                onConfirm={(newTags) => {
                  setOpenTags(false);
                  handleUpdateTags(newTags);
                }}
                onCreateTag={handleCreateTag}
                open={openTags}
                onOpenChange={setOpenTags}
                trigger={
                  <div className="flex flex-wrap gap-1.5">
                    {tags.length === 0 ? (
                      <div className="flex items-center justify-center w-full p-1 rounded text-neutral-500">
                        Không có thẻ được thêm vào
                      </div>
                    ) : (
                      <>
                        {tags.slice(0, 4).map((tag) => (
                          <Badge
                            key={tag}
                            variant="ghost"
                            className="text-xs outline-1 outline-neutral-300 text-black"
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
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}