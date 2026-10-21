"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar1,
  CalendarArrowUp,
  Inbox,
  Plus,
  Repeat,
  Folder,
  File,
  Flag,
  Palette,
  Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import TaskDescriptionEditor from "./TaskDescriptionEditor";
import { TaskComments } from "./task-comments";

import TagCombobox from "@/app/(front)/components/tagCompobox";
import PriorityDropdown from "@/app/(front)/components/piorityCombobox";
import CalendarComponent from "@/app/(front)/components/calendar/calendar.component";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/(front)/components/ui/dropdown-menu";
import ColorPicker from "@/app/(front)/components/color/colorPicker.component";
import { TaskCheckbox } from "@/app/(front)/components/task/taskCard";
import { useWorkspaceStore } from "@/app/(front)/feature/store/workspace.state";
import { IRuleModel } from "@/app/(front)/model";
import { formatDate } from "@/app/(front)/utils/getDayOfMonth.utils";
import { formatTimer } from "@/app/(front)/utils/formatTimer";
import { useTask } from "@/app/(front)/feature/hook/task/task.hook";
type TaskProperty =
  "list" | "date" | "deadline" | "priority" | "color" | "tags";

function subscribeDesktop(onChange: () => void) {
  const media = window.matchMedia("(min-width: 768px)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

interface TaskDetailProps {
  taskId: string;
}

export default function TaskDetail({ taskId }: Readonly<TaskDetailProps>) {
  const router = useRouter();
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );

  const {
    task,
    color: colorStore,
    handleUpdateTask,
    handleUpdateRule,
    handleUpdateTags,
    isUpdatingRule,
    handleCreateTag,
    toggleStatus,
    handleUpdateColorTask,
  } = useTask(taskId);
  const listIndex = useWorkspaceStore((s) => s.listIndex);
  const sectionIndex = useWorkspaceStore((s) => s.sectionIndex);
  const [name, setName] = useState(task?.name ?? "");
  const [color, setColor] = useState<string>(
    colorStore ? colorStore.color : task?.color,
  );
  const [propertyOpen, setPropertyOpen] = useState(false);
  const [activeProperty, setActiveProperty] = useState<TaskProperty>("list");
  const [openTags, setOpenTags] = useState(false);
  const [openPriority, setOpenPriority] = useState(false);
  const isEditingName = useRef(false);

  useEffect(() => {
    if (!task || isEditingName.current) return;
    setName(task.name ?? "");
  }, [taskId, task.name, task]);
  const commitName = useCallback(() => {
    if (!task) return;
    const newName = name.trim();
    if (!newName) {
      setName(task.name ?? "");
      return;
    }
    if (newName === task.name) return;
    handleUpdateTask(taskId, { name: newName });
  }, [handleUpdateTask, name, task, taskId]);

  useEffect(() => {
    if (!task) return;
    const newName = name.trim();
    if (!newName || newName === task.name) return;
    const t = setTimeout(commitName, 1000);
    return () => clearTimeout(t);
  }, [commitName, name, task, task.name]);

  useEffect(() => {
    if (!task || !color) return;
    if (!colorStore && color == task.color) return;
    if (colorStore?.color == color) return;
    const t = setTimeout(() => {
      handleUpdateColorTask(taskId, color);
    }, 500);
    return () => clearTimeout(t);
  }, [color, colorStore, handleUpdateColorTask, task, taskId]);

  const handleOpenChange = (open: boolean) => {
    if (!open) router.back();
  };

  if (!task) return null;

  const tags = task.rule?.tags ?? [];
  const listName = listIndex[task.list]?.name;
  const propertyItems = [
    {
      key: "list",
      label: "Danh sách",
      value: listName || "Danh sách",
      Icon: Folder,
    },
    {
      key: "date",
      label: "Ngày",
      value: task.rule?.start_date
        ? formatDate(task.rule.start_date)
        : "Thêm ngày",
      Icon: Calendar1,
    },
    {
      key: "deadline",
      label: "Hạn chót",
      value: task.rule?.end_date ? formatDate(task.rule.end_date) : "Hạn chót",
      Icon: CalendarArrowUp,
    },
    {
      key: "priority",
      label: "Độ ưu tiên",
      value: "P" + (task.rule?.priority ?? 4),
      Icon: Flag,
    },
    { key: "color", label: "Màu", value: "Màu", Icon: Palette },
    {
      key: "tags",
      label: "Thẻ",
      value: tags.length ? "Thẻ (" + tags.length + ")" : "Thêm thẻ",
      Icon: Tag,
    },
  ] satisfies {
    key: TaskProperty;
    label: string;
    value: string;
    Icon: typeof Folder;
  }[];

  const visiblePropertyItems = propertyItems.flatMap<{
    key: TaskProperty;
    label: string;
    value: string;
    Icon: typeof Folder;
    itemId: string;
  }>((item) => {
    if (item.key !== "tags" || tags.length === 0) {
      return [{ ...item, itemId: item.key }];
    }
    const tagItems = tags.slice(0, 3).map((tag) => ({
      ...item,
      itemId: `tag:${tag}`,
      value: tag,
    }));

    if (tags.length > 3) {
      tagItems.push({
        ...item,
        itemId: "tags:more",
        value: `+${tags.length - 3}`,
      });
    }

    return tagItems;
  });

  const renderListDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Chuyển task sang danh sách hoặc section"
          className="flex min-w-0 max-w-full items-center gap-2 rounded-sm border p-1.5 text-left text-sm font-normal text-neutral-700"
        >
          <Inbox className="size-3 shrink-0" />
          <span className="truncate">
            {listName?.toLocaleLowerCase() === "inbox" ? "Hộp thư" : listName}
            {task.section && sectionIndex[task.section]
              ? ` / ${sectionIndex[task.section].name}`
              : ""}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-50 min-w-50 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-none p-0">
        {Object.values(listIndex).map((list) => (
          <div key={list.id}>
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-3 rounded-none border-b p-2"
              onSelect={() => handleUpdateTask(taskId, { list: list.id, section: "" })}
            >
              <Folder className="size-3 shrink-0" />
              <span className="truncate">{list.name.toLocaleLowerCase() === "inbox" ? "Hộp thư" : list.name}</span>
            </DropdownMenuItem>
            {list.sections?.map((sectionId) => {
              const section = sectionIndex[sectionId];
              if (!section) return null;
              return (
                <DropdownMenuItem
                  key={sectionId}
                  className="flex cursor-pointer items-center gap-3 rounded-none border-b p-2"
                  onSelect={() => handleUpdateTask(taskId, { list: list.id, section: sectionId })}
                >
                  <File className="ml-3 size-3 shrink-0" />
                  <span className="truncate">{section.name}</span>
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderProperty = (property: TaskProperty) => {
    const propertyDate =
      property === "deadline" ? task.rule?.end_date : task.rule?.start_date;
    switch (property) {
      case "list":
        return (
          <>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-bold">Danh sách</span>
              {renderListDropdown()}
            </div>
          </>
        );
      case "deadline":
      case "date":
        return (
          <>
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
                  ) => handleUpdateRule(task.id, rule)}
                  trigger={
                    <div className="w-full flex flex-col gap-2">
                      <span className="text-sm font-bold">
                        {property === "deadline" ? "Hạn chót" : "Ngày"}
                      </span>
                      <Button
                        variant="outline"
                        className="flex h-auto min-h-9 w-full p-1.5! cursor-pointer justify-start whitespace-normal text-left text-sm rounded-sm bg-transparent! hover:bg-transparent! text-neutral-700!"
                      >
                        {propertyDate ? (
                          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                            <Calendar1 />
                            <p>{formatDate(propertyDate)}</p>
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
                            <span className="text-sm">
                              {property === "deadline"
                                ? "Thêm hạn chót"
                                : "Thêm ngày"}
                            </span>
                          </div>
                        )}
                      </Button>
                    </div>
                  }
                />
              )}
            </div>
          </>
        );
      case "priority":
        return (
          <>
            <div className="min-w-0">
              <div className="grid gap-1.5">
                <span className="text-sm font-bold">Độ ưu tiên</span>
                <PriorityDropdown
                  onSelectPriority={(p) =>
                    handleUpdateRule(task.id, {
                      priority: p as 1 | 2 | 3 | 4,
                    })
                  }
                  priority={task.rule?.priority ?? 4}
                  align="center"
                  open={openPriority}
                  onOpenChange={setOpenPriority}
                />
              </div>
            </div>
          </>
        );
      case "color":
        return (
          <>
            <div className="w-full flex flex-col gap-1.5">
              <span className="text-sm font-bold">Màu</span>
              <ColorPicker inline value={color} onChange={setColor} />
            </div>
          </>
        );
      case "tags":
        return (
          <>
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
                isPending={isUpdatingRule}
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
                        {tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="ghost"
                            className="max-w-full whitespace-normal wrap-anywhere text-xs outline-1 outline-neutral-300 text-black"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tags.length - 3}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                }
              />
            </div>
          </>
        );
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="m-0 flex h-dvh w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[min(600px,90dvh)] sm:w-[calc(100%-2rem)] sm:max-w-4xl sm:rounded-sm">
        <DialogHeader className="shrink-0 border-b p-3 pr-12">
          <DialogTitle>
            {renderListDropdown()}
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain sm:overflow-hidden md:flex-row">
          <div className="flex min-w-0 shrink-0 flex-col gap-4 p-4 sm:min-h-0 sm:flex-1 sm:shrink sm:overflow-y-auto sm:p-5">
            <div className="flex min-w-0 items-center justify-start gap-3">
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
                className="min-w-0 flex-1 text-xl! sm:text-2xl! font-semibold outline-none! border-0 bg-transparent! focus:outline-0! placeholder:text-neutral-300"
                placeholder="Tên công việc"
              />
            </div>
            <Dialog
              open={propertyOpen && !isDesktop}
              onOpenChange={setPropertyOpen}
            >
              <div
                className="flex min-w-0 flex-wrap gap-2 md:hidden"
                aria-label="Thuộc tính công việc"
              >
                {visiblePropertyItems.map(({ key, itemId, label, value, Icon }) => (
                  <DialogTrigger key={itemId} asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 max-w-full min-w-0 gap-2 rounded-full px-3 text-sm"
                      onClick={() => setActiveProperty(key)}
                      aria-label={`${label}: ${value}`}
                      title={`${label}: ${value}`}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{value}</span>
                      {key === "color" && (
                        <span
                          className="size-3 shrink-0 rounded-full border"
                          style={{ backgroundColor: color }}
                          aria-hidden="true"
                        />
                      )}
                    </Button>
                  </DialogTrigger>
                ))}
              </div>
              <DialogContent className="flex h-dvh max-h-dvh w-full max-w-none min-w-0 flex-col gap-4 overflow-y-auto rounded-none sm:h-auto sm:max-h-[85dvh] sm:max-w-md sm:rounded-xl">
                <DialogHeader className="pr-8">
                  <DialogTitle>
                    {
                      propertyItems.find((item) => item.key === activeProperty)
                        ?.label
                    }
                  </DialogTitle>
                  <DialogDescription>
                    Chỉnh sửa thuộc tính của công việc.
                  </DialogDescription>
                </DialogHeader>
                <div className="min-w-0 space-y-4">
                  {renderProperty(activeProperty)}
                </div>
              </DialogContent>
            </Dialog>
            <div className="w-full min-w-0 wrap-anywhere">
              <TaskDescriptionEditor
                key={taskId}
                value={task.description ?? ""}
                onSave={(description) =>
                  handleUpdateTask(taskId, { description })
                }
              />
            </div>
            <div className="hidden sm:block">
              <TaskComments key={taskId} taskId={taskId} />
            </div>
          </div>

          {isDesktop && (
            <aside
              aria-label="Thuộc tính công việc"
              className="hidden min-h-0 w-70 shrink-0 space-y-5 overflow-y-auto border-l bg-primary/5 p-5 md:block"
            >
              {propertyItems.map(({ key }) => (
                <div key={key}>{renderProperty(key)}</div>
              ))}
            </aside>
          )}
          <div className="sm:hidden p-5 pb-20">
            <TaskComments key={taskId} taskId={taskId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
   
