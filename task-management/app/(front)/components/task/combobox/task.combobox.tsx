"use client";
import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  Inbox as InboxIcon,
  List as ListIcon,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "../../ui/dropdown-menu";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { ISectionModelState, ITaskModel } from "@/app/(front)/model";

type TaskComboboxProps = {
  disabled?: boolean;
  value?: ITaskModel;
  onSelect: (task: ITaskModel) => void;
};

type GroupedSection = {
  section: ISectionModelState;
  tasks: ITaskModel[];
};

export function ListCombobox({ disabled, value, onSelect }: Readonly<TaskComboboxProps>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // selector riêng lẻ: chỉ render lại khi đúng phần đó đổi
  const inbox = useWorkspaceStore((s) => s.inbox);
  const listIndex = useWorkspaceStore((s) => s.listIndex);
  const sectionIndex = useWorkspaceStore((s) => s.sectionIndex);
  const taskIndex = useWorkspaceStore((s) => s.taskIndex);

  const [activeListId, setActiveListId] = useState<string | null>(inbox);

  const lists = useMemo(() => Object.values(listIndex), [listIndex]);
  const activeList = activeListId ? listIndex[activeListId] : null;

  const groupedSections = useMemo<GroupedSection[]>(() => {
    if (!activeList) return [];

    return activeList.sections.flatMap((sectionId) => {
      const section = sectionIndex[sectionId];
      if (!section) return [];

      const tasks = (section.tasks ?? [])
        .map((taskId) => taskIndex[taskId])
        .filter((t): t is ITaskModel => Boolean(t));

      return [{ section, tasks }];
    });
  }, [activeList, sectionIndex, taskIndex]);

  const filteredSections = useMemo<GroupedSection[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groupedSections;

    return groupedSections
      .map((group) => ({
        section: group.section,
        tasks: group.tasks.filter((task) => task.name.toLowerCase().includes(q)),
      }))
      .filter((group) => group.tasks.length > 0);
  }, [groupedSections, search]);

  const hasAnyTask = filteredSections.some((g) => g.tasks.length > 0);

  const resetAndClose = () => {
    setSearch("");
    setOpen(false);
  };

  const renderListLabel = (id: string | null, name?: string) =>
    id === inbox ? (
      <>
        <InboxIcon className="h-4 w-4" />
        <span className="truncate">Hộp thư</span>
      </>
    ) : (
      <>
        <ListIcon className="h-4 w-4 text-muted-foreground" />
        <span className="truncate">{name}</span>
      </>
    );

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setSearch("");
          setActiveListId(inbox);
        }
        setOpen(o);
      }}
    >
      <DropdownMenuTrigger
        asChild
        disabled={disabled}
        className="hover:bg-transparent! focus:outline-0 data-[state=open]:bg-transparent!"
      >
        <Button
          variant="ghost"
          className="text-sm focus:bg-transparent! focus:outline-0! text-neutral-400 hover:bg-transparent! disabled:opacity-100"
        >
          {value ? value.name : "thêm nhiệm vụ"}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="p-0 mt-2 w-80 max-h-96 overflow-hidden flex flex-col"
        align="center"
        side="bottom"
      >
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()} // không để Radix bắt phím
              placeholder="Search"
              className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </div>

        <div className="px-3 pb-1">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold">
              {renderListLabel(activeListId, activeList?.name)}
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent className="p-1 w-64 max-h-60 overflow-y-auto">
              {lists.map((list) => (
                <DropdownMenuItem
                  key={list.id}
                  onSelect={(e) => {
                    e.preventDefault(); // giữ menu cha không đóng
                    setActiveListId(list.id);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 text-sm",
                    activeListId === list.id && "bg-accent"
                  )}
                >
                  {renderListLabel(list.id, list.name)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </div>

        <div className="flex-1 overflow-y-auto px-1 pb-2">
          {!hasAnyTask ? (
            <div className="text-xs text-muted-foreground text-center py-4">
              Không có nhiệm vụ nào.
            </div>
          ) : (
            filteredSections.map(({ section, tasks }) => (
              <div key={section.id} className="mb-2">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {section.name}
                </div>
                {tasks.map((task) => {
                  const selected = value?.id === task.id;
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => {
                        onSelect(task);
                        resetAndClose();
                      }}
                      className={cn(
                        "flex items-center gap-2 px-2 py-2 text-sm text-left rounded w-full",
                        selected ? "bg-violet-50" : "hover:bg-accent"
                      )}
                    >
                      <span
                        className={cn(
                          "h-4 w-4 rounded-full border-2 shrink-0",
                          selected ? "bg-violet-500" : "border-muted-foreground/40"
                        )}
                      />
                      <span className="flex-1 truncate">{task.name}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}