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
} from "../../ui/dropdown-menu";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { IListModel, ISectionModel, ITaskModel } from "@/app/(front)/model";

type TaskComboboxProps = {
  disabled?: boolean;
  value?: ITaskModel;
  onSelect: (task: ITaskModel) => void;
};

type ListItem = Pick<IListModel, "isShareList" | "name" | "user" | "id" | "sections">;
type GroupedSection = {
  section: ISectionModel;
  tasks: ITaskModel[];
};

export function ListCombobox({ disabled, value, onSelect }: Readonly<TaskComboboxProps>) {
  const [open, setOpen] = useState(false);
  const [listPickerOpen, setListPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { inbox, listIndex } = useWorkspaceStore();
  const [activeListId, setActiveListId] = useState<string | null>(inbox);
  const lists: ListItem[] = useMemo(
    () => Object.values(listIndex ?? {}).map((entry: any) => entry.list) as ListItem[],
    [listIndex]
  );
  const activeEntry = activeListId ? (listIndex as any)?.[activeListId] : null;
  const activeList: ListItem | null = activeEntry?.list ?? null;

  // Nhóm task theo từng section, KHÔNG làm phẳng mất thông tin section
  const groupedSections: GroupedSection[] = useMemo(() => {
    return (activeList?.sections ?? []).map((section) => ({
      section,
      tasks: section.tasks ?? [],
    }));
  }, [activeList]);

  // Lọc theo search, nhưng vẫn giữ cấu trúc section (chỉ ẩn section rỗng sau khi lọc)
  const filteredSections: GroupedSection[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groupedSections;

    return groupedSections
      .map((group) => ({
        section: group.section,
        tasks: group.tasks.filter((task) =>
          task.name.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.tasks.length > 0); // ẩn section không còn task nào khớp
  }, [groupedSections, search]);

  const hasAnyTask = filteredSections.some((g) => g.tasks.length > 0);

  const resetAndClose = () => {
    setSearch("");
    setOpen(false);
  };

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
              placeholder="Search"
              className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </div>

        <div className="px-3 pb-1">
          <DropdownMenu open={listPickerOpen} onOpenChange={setListPickerOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold hover:bg-accent rounded w-full">
                {activeListId === inbox ? (
                  <>
                    <InboxIcon className="h-4 w-4 " />
                    <span className="truncate">{"Hộp thư"}</span>
                  </>
                ) : (
                  <>
                    <ListIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{activeList?.name}</span>
                  </>
                )}
                <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="p-1 w-64 max-h-60 overflow-y-auto"
              align="start"
              side="bottom"
            >
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => {
                    setActiveListId(list.id);
                    setListPickerOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 text-sm w-full rounded hover:bg-accent text-left",
                    activeListId === list.id && "bg-accent"
                  )}
                >
                  {list.id === inbox ? (
                    <>
                      <InboxIcon className="h-4 w-4 " />
                      <span className="truncate">{"Hộp thư"}</span>
                    </>
                  ) : (
                    <>
                      <ListIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{list.name}</span>
                    </>
                  )}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 overflow-y-auto px-1 pb-2">
          {!hasAnyTask ? (
            <div className="text-xs text-muted-foreground text-center py-4">
              Không có nhiệm vụ nào.
            </div>
          ) : (
            filteredSections.map(({ section, tasks }) => (
              <div key={section.id} className="mb-2">
                {/* Tiêu đề section để phân biệt task thuộc section nào */}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {section.name}
                </div>
                {tasks.map((task) => {
                  const selected = value?.id === task.id;
                  return (
                    <button
                      key={task.id}
                      onClick={() => {
                        onSelect(task); // truyền đúng ITaskModel, không còn nhầm với section
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
                          selected ? " bg-violet-500" : "border-muted-foreground/40"
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