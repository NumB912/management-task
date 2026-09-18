"use client";
import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import ListDropDown from "../../component/ui/list.component";
import CalendarComponent from "../calendar/calendar.component";
import { ITaskModel } from "../../model";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Calendar,
    Calendar1,
    CalendarOff,
    Check,
    ChevronUpIcon,
    File,
    Flag,
    Folder,
    MoveRight,
    Pencil,
    Repeat,
    Sunrise,
    Tag,
    TagIcon,
    Trash2,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "../../utils/getDayOfMonth.utils";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Field, FieldLabel } from "../ui/field";
import { IRuleModel } from "../../model/rule/rule.model";
import TagCombobox from "../tagCompobox";
import {
    useRemoveTask,
    useUpdateRule,
    useUpdateTask,
    useUpdateTaskStatus,
} from "../../feature/hook/useTaskMutation.hook";
import EditTask from "./editTask";
import { useWorkspaceStore } from "../../states/workspace.state";
import { useShallow } from "zustand/react/shallow";
import { Ipriority, IStatus } from "../../model/type/type";
import { useCreateTag } from "../../feature/hook/useTagMutation.hook";
import { formatTimer } from "../../utils/formatTimer";
import { calculateNextDate } from "../../utils/caculateNextDay";


export interface TaskProp {
    taskId: string;
    depth: number;

}

const PRIORITY_COLORS: Record<number, string> = {
    1: "text-red-500!",
    2: "text-orange-500!",
    3: "text-blue-500!",
    4: "text-gray-400!",
};

const PRIORITY_BORDER: Record<number, string> = {
    1: "border-red-500!",
    2: "border-orange-500!",
    3: "border-blue-500!",
    4: "border-gray-400!",
};
interface TaskCheckboxProps {
    status: IStatus;
    priority: Ipriority | undefined;
    onHandle: () => void;
}
export function TaskCheckbox({
    status,
    priority,
    onHandle,
}: Readonly<TaskCheckboxProps>) {
    return (
        <Button
            onClick={(e) => {
                e.stopPropagation();
                onHandle();
            }}
            className={cn(
                "w-5! h-5! aspect-square! z-20 bg-transparent border flex items-center justify-center cursor-pointer hover:bg-gray-300 text-neutral-900",
                priority
                    ? PRIORITY_BORDER[priority] + " " + PRIORITY_COLORS[priority]
                    : "border-gray-400",
            )}
        >
            {status === "done" && <Check />}
            {status === "won't do" && <X />}
        </Button>
    );
}

export const Task = React.memo(({ taskId, depth }: TaskProp) => {
    const [isShowChildren, setIsShowChildren] = useState(false);
    const [isOpenTaskEdit, setisOpenTaskEdit] = useState<boolean>(false);
    const [openTagEdit, setOpenTagEdit] = useState<boolean>(false);
    const [openContextMenu, setOpenContextMenu] = useState<boolean>(false);
    const listGet = useWorkspaceStore(
        (state) => state.getListWithName
    );
    const addTask = useWorkspaceStore((state) => state.addTask)
    const updateStatus = useWorkspaceStore((state)=>state.updateTask)
    const lists = useMemo(() => {
        return listGet("")
    }, [])
    const task = useWorkspaceStore(useShallow((state)=>state.taskIndex[taskId]))
    const [isUpdatingTags, setIsUpdatingTags] = useState<boolean>(false)
    const taskRef = useRef<HTMLDivElement>(null);
    const { mutate: updateRule } = useUpdateRule(task.list)
    const { mutate: updateTask } = useUpdateTask(task.list)
    const { mutate: deleteTask } = useRemoveTask(task.list)
    const { mutate: updateStatusApi } = useUpdateTaskStatus()
    const { mutate: createTag } = useCreateTag()
    const updateTaskStore = useWorkspaceStore((state) => state.updateTask)
    const handleConfirmTags = (tags: string[]) => {
        updateRule(
            { taskId: task.id, data: { ...task.rule, tags } },
            { onSuccess: () => setOpenTagEdit(false) },
        );
    }

    if (!task && depth > 4 || !task.id) {
        return;
    }


    const handleUpdateTask = (id: string, data: Partial<ITaskModel>) => {
        updateTask({
            taskId: id,
            data: data
        }, {
            onError: () => {

            }
        })
    }

const handleUpdateStatusTask = (taskId: string, status: IStatus) => {
    if (task.rule?.start_date && task.rule.repeat.mode !== "none") {
        const nextDate = calculateNextDate(task.rule.repeat, task.rule.start_date);
        const shouldStopRepeating = task.rule.end_date && nextDate && new Date(nextDate) < new Date(task.rule.end_date);
        if (nextDate && !shouldStopRepeating) {
            addTask({
                ...task,
                id: `temp-${Date.now()}`,
                status: "pending",
                rule: { ...task.rule, start_date: nextDate },
            }, task.list, task.section)
        }
    }
    const snapShot = task
    updateStatus(taskId, {
        status: status,
        rule: {
            ...task.rule,
            repeat: { ...task.rule.repeat, mode: "none" },
        },
    })

    updateStatusApi({
        taskId:taskId,
        data:{
            status:status
        }
    },{
        
    })

    
}
    const handleDeleteTask = (taskId: string) => {
        deleteTask(taskId, {
            onError: () => {

            }
        })
    }

    return (
        <div className="task flex flex-col flex-1">
            {!isOpenTaskEdit && (
                <div ref={taskRef}>
                    <ContextMenu
                        open={openContextMenu}
                        onOpenChange={(open) => setOpenContextMenu(open)}
                    >
                        <ContextMenuTrigger asChild>
                            <div className="w-full hover:bg-gray-200 cursor-pointer p-2 relative">
                                <Link
                                    href={`/dashboard/tasks/${task.id}`}
                                    className="inset-0 absolute"
                                />
                                <div
                                    className={`flex z-10 gap-2 items-start w-full h-full ${depth === 0 ? "" : "pl-5"}`}
                                >
                                    <div className="flex items-center justify-center h-full">
                                        {task.children?.length > 0 && (
                                            <Button
                                                className={`transition-all p-0! aspect-square z-10 rounded-full! duration-150 bg-transparent text-neutral-900 hover:bg-gray-300 ${isShowChildren ? "rotate-180" : "rotate-0"}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsShowChildren((prev) => !prev);
                                                }}
                                            >
                                                <ChevronUpIcon />
                                            </Button>
                                        )}
                                        <TaskCheckbox
                                            status={task.status}
                                            priority={task?.rule?.priority ?? 4}
                                            onHandle={() => {
                                                task.status !== "pending" ? handleUpdateStatusTask(task.id, "pending") : handleUpdateStatusTask(task.id, "done")
                                            }
                                            }
                                        />
                                    </div>

                                    <div className="w-full flex flex-col">
                                        <p className="text-sm truncate min-w-30 max-w-50">{task.name}</p>
                                        <div className="flex items-center gap-0.5 text-neutral-500 flex-wrap">
                                            {task.rule?.start_date && (
                                                <CalendarComponent
                                                    rule={task.rule}
                                                    onChangeSubmit={(rule: Pick<IRuleModel, "end_date" | "repeat" | "start_date" | "timer">) => {
                                                        updateRule({ data: rule, taskId: task.id })

                                                    }}
                                                    trigger={
                                                        <Button className="flex rounded text-primary bg-transparent hover:bg-transparent">
                                                            <Calendar />
                                                            <p className="text-xs">
                                                                {formatDate(task.rule.start_date)}
                                                            </p>
                                                        </Button>
                                                    }
                                                />
                                            )}

                                            {task.rule?.timer && (
                                                <div className="p-1 text-xs">{formatTimer(task.rule?.timer)}</div>
                                            )}

                                            {task.rule?.repeat?.mode !== "none" && (
                                                <Repeat className="w-3 h-3" />
                                            )}
                                            {task.rule?.priority && (
                                                <div className="p-1">P{task.rule.priority}</div>
                                            )}
                                        </div>

                                        {task.rule?.tags?.length > 0 && (
                                            <div className="flex items-center gap-0.5 text-sm text-gray-500">
                                                {task.rule.tags.slice(0, 3).map((tag) => (
                                                    <Link
                                                        href={`/dashboard/tags/${tag}`}
                                                        key={tag}
                                                        className={cn(
                                                            "flex items-center gap-0.5 p-0.5! bg-transparent! text-neutral-600 hover:bg-transparent! hover:underline z-30",
                                                        )}
                                                    >
                                                        <Tag size={13} />
                                                        {tag}
                                                    </Link>
                                                ))}
                                                {task.rule?.tags.length > 3 && (
                                                    <span className="text-xs text-neutral-400 px-1">
                                                        +{task.rule.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ContextMenuTrigger>

                        <ContextMenuContent className="w-55 p-2">
                            <ContextMenuItem
                                className={cn("p-2")}
                                onSelect={() => {
                                    setisOpenTaskEdit(true);
                                }}
                            >
                                <Pencil className="mr-1 h-6 w-6" />
                                Sửa (Edit)
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <Field className="flex py-1.5 ">
                                <FieldLabel className="font-extralight text-neutral-700 text-sm">
                                    Ngày
                                </FieldLabel>
                                <div className="flex gap-0.5 items-center justify-start">
                                    <Button
                                        type="button"
                                        variant={"ghost"}
                                        aria-label={`Hôm nay`}
                                        className={cn(
                                            "flex items-center justify-center rounded p-2 aspect-square border transition-colors",
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            updateRule({
                                                taskId: task.id,
                                                data: {
                                                    start_date: new Date(),
                                                },
                                            });
                                            setOpenContextMenu(false);
                                        }}
                                    >
                                        <Calendar1 className="h-5! w-5! stroke-[1.5px]" />
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        aria-label="Ngày mai"
                                        className={cn(
                                            "flex items-center justify-center w-fit rounded p-2 border transition-colors",
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const tomorrow = new Date();
                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                            updateRule({
                                                taskId: task.id,
                                                data: {
                                                    start_date: tomorrow,
                                                },
                                            });
                                            setOpenContextMenu(false);
                                        }}
                                    >
                                        <Sunrise className="h-5! w-5! stroke-[1.5px]" />
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        aria-label="Tuần sau"
                                        className={cn(
                                            "flex items-center justify-center w-fit rounded p-2 border transition-colors",
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const nextWeek = task.rule?.start_date
                                                ? new Date(task.rule.start_date)
                                                : new Date();

                                            nextWeek.setDate(nextWeek.getDate() + 7);

                                            updateRule({
                                                taskId: task.id,
                                                data: {
                                                    start_date: nextWeek,
                                                },
                                            });
                                            setOpenContextMenu(false);
                                        }}
                                    >
                                        <ArrowRight className="h-5! w-5! stroke-[1.5px]" />
                                    </Button>

                                    <CalendarComponent
                                        onChangeSubmit={(
                                            rule: Pick<
                                                IRuleModel,
                                                "repeat" | "timer" | "end_date" | "start_date"
                                            >,
                                        ) => {
                                            updateRule({
                                                taskId: task.id,
                                                data: {
                                                    ...rule,
                                                },
                                            });
                                            setOpenContextMenu(false);
                                        }}
                                        trigger={
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                aria-label="Chọn ngày khác"
                                                className={cn(
                                                    "flex items-center justify-center w-fit rounded p-2! border transition-colors",
                                                )}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <Calendar className="h-5! w-5! stroke-[1.5px]" />
                                            </Button>
                                        }
                                        rule={
                                            task.rule as Pick<
                                                IRuleModel,
                                                "repeat" | "timer" | "end_date" | "start_date"
                                            >
                                        }
                                    />
                                    {task.rule?.start_date && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            aria-label="Không ngày"
                                            className={cn(
                                                "flex items-center justify-center w-fit rounded p-2 border transition-colors text-muted-foreground",
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                updateRule({
                                                    taskId: task.id,
                                                    data: {
                                                        end_date: null,
                                                        priority: 4,
                                                        repeat: {
                                                            mode: "none",
                                                        },
                                                        start_date: null,
                                                        timer: null,
                                                    },
                                                });

                                                setOpenContextMenu(false);
                                            }}
                                        >
                                            <CalendarOff className="h-5! w-5! stroke-[1.5px]" />
                                        </Button>
                                    )}
                                </div>
                            </Field>

                            <Field className="flex gap-2 py-1.5">
                                <FieldLabel className="font-extralight text-neutral-700 text-sm">
                                    Mức độ ưu tiên
                                </FieldLabel>
                                <div className="flex gap-0.5 items-center justify-start">
                                    {[1, 2, 3, 4].map((p) => {
                                        const isActive = task.rule?.priority === p;
                                        return (
                                            <Button
                                                key={p}
                                                type="button"
                                                variant={"ghost"}
                                                aria-label={`Ưu tiên P${p}`}
                                                className={cn(
                                                    "flex items-center justify-center w-fit rounded p-2 border transition-colors",
                                                    PRIORITY_COLORS[p],
                                                    isActive ? "bg-neutral-100" : "",
                                                )}
                                                onClick={(e) => {
                                                    e.preventDefault();


                                                    updateRule({
                                                        taskId: task.id,
                                                        data: {
                                                            priority: p as 1 | 2 | 3 | 4,
                                                        },
                                                    });
                                                    updateTaskStore(task.id, {
                                                        rule: {
                                                            ...task.rule,
                                                            priority: p as 1 | 2 | 3 | 4,
                                                        }
                                                    })
                                                    setOpenContextMenu(false);
                                                }}
                                            >
                                                <Flag
                                                    className={cn(
                                                        "h-5! w-5! stroke-[1.5px] fill-current",
                                                    )}
                                                />
                                            </Button>
                                        );
                                    })}
                                </div>
                            </Field>
                            <ContextMenuSeparator />
                            <ContextMenuSub>
                                <ContextMenuSubTrigger className={cn("p-2 gap-2")}>
                                    <MoveRight className="mr-1 h-4 w-4" />
                                    <span>Chuyển tới</span>
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent sideOffset={10}>
                                    {lists?.map((list) => (
                                        <React.Fragment key={list.id}>
                                            {list.sections?.length ? (
                                                <ContextMenuSub>
                                                    <ContextMenuSubTrigger
                                                        onClick={() => {
                                                            updateTask({
                                                                taskId: task.id,
                                                                data: {
                                                                    list: list.id,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        <Folder className="mr-1 h-4 w-4" />
                                                        {list.name}
                                                    </ContextMenuSubTrigger>
                                                    <ContextMenuSubContent sideOffset={10}>
                                                        {list.sections.map((section) => (
                                                            <ContextMenuItem
                                                                key={section.id}
                                                                textValue="hello"
                                                                onSelect={() => {
                                                                    handleUpdateTask(task.id, {
                                                                        list: list.id,
                                                                        section: section.id
                                                                    })
                                                                }}
                                                            >
                                                                <File className="mr-1 h-4 w-4" />
                                                                {section.name}
                                                            </ContextMenuItem>
                                                        ))}
                                                    </ContextMenuSubContent>
                                                </ContextMenuSub>
                                            ) : (
                                                <ContextMenuItem
                                                    onSelect={() => {
                                                        handleUpdateTask(task.id, {


                                                            list: list.id,

                                                        });
                                                    }}
                                                >
                                                    {list.name}
                                                </ContextMenuItem>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </ContextMenuSubContent>
                            </ContextMenuSub>

                            <ContextMenuItem
                                className={cn("p-2")}
                                onSelect={(e) => {
                                    setOpenTagEdit(true);
                                }}
                            >
                                <TagIcon className="mr-1 h-6 w-6" />
                                Thẻ
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                                className={cn("p-2")}
                                variant="destructive"
                                onSelect={() => handleDeleteTask(task.id)}
                            >
                                <Trash2 className="mr-1 h-6 w-6" />
                                Xoá
                            </ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>

                    {/* <ListDropDown isOpen={isShowChildren}>
                        <div className="min-h-0 overflow-y-scroll">
                            {task.children?.map((value: ITaskModel) => (
                                <Task key={value.id} task={value} depth={depth + 1} onDelete={handleDeleteTask} />
                            ))}
                        </div>
                    </ListDropDown> */}
                </div>
            )}
            <EditTask
                listId={task.list}
                setIsEditing={setisOpenTaskEdit}
                isEditing={isOpenTaskEdit}
                onUpdateTask={handleUpdateTask}
                task={task}
            />
            <TagCombobox
                open={openTagEdit}
                onOpenChange={setOpenTagEdit}
                selectedTags={task.rule?.tags ?? []}
                isPending={isUpdatingTags}
                onCreateTag={(name) => createTag({ name })}
                onConfirm={handleConfirmTags}
            />
        </div>
    );
});