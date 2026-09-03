"use client";
import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useWorkspaceStore } from "../states/workspace.state";
import { useShallow } from "zustand/react/shallow";
import { ITaskModel } from "../model";
import { useUpdateRule, useUpdateTask } from "../feature/hook/useTaskMutation.hook";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useCreateTag, useRemoveTagOnlyMe } from "../feature/hook/useTagMutation.hook";

interface TagComboboxProps {
  task: ITaskModel;
  setOpen:(open:boolean)=>void
  open:boolean
}

const TagCombobox = ({ task,open,setOpen }: TagComboboxProps) => {
  const [search, setSearch] = useState("");
  const allTags = useWorkspaceStore(useShallow((s) => s.getTagWithName("")));
  const { mutate, isPending } = useUpdateRule(task.list);
  const {mutate:CreateTag} = useCreateTag()
  const taskTags = task.rule?.tags ?? [];
  const [pendingTags, setPendingTags] = useState<string[]>(taskTags);
  useEffect(() => {
    if (open) {
      setPendingTags(taskTags);
    }
  }, [open]);

  const toggleTag = (tag: string) => {
    setPendingTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const removeTag = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    setPendingTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleAddTag = ()=>{
          CreateTag({
            name:search.trim()
          })
          toggleTag(search.trim());
          setSearch("");
  }

  const hasChanges =
    pendingTags.length !== taskTags.length ||
    pendingTags.some((t) => !taskTags.includes(t));

  const handleConfirm = () => {
    mutate(
      {
        taskId: task.id,
        data: { ...task.rule, tags: pendingTags } ,
      },
      {
        onSuccess: () => setOpen(false),
      },
    );
  };

  const handleCancel = () => {
    setPendingTags(taskTags);
    setOpen(false);
  };

  const filteredTags = allTags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const canCreate =
    search.trim().length > 0 &&
    !allTags.some((t) => t.name.toLowerCase() === search.trim().toLowerCase());

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setPendingTags(taskTags);
        }
        setOpen(next);
      }}
    >
      <DropdownMenuTrigger asChild>
        <div className="h-0 w-0"></div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Tìm hoặc tạo tag..."
            value={search}
            onValueChange={setSearch}
          />
          {pendingTags.length > 0 && (
            <div className="flex flex-wrap gap-1 px-2 py-1.5 border-b">
              {pendingTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => removeTag(e, tag)}
                  />
                </Badge>
              ))}
            </div>
          )}

          <CommandList>
            <CommandEmpty>Không tìm thấy tag.</CommandEmpty>
            <CommandGroup>
              {filteredTags.map((tag) => {
                const isSelected = pendingTags.includes(tag.name);
                return (
                  <CommandItem
                    key={tag.name}
                    value={tag.name}
                    onSelect={() => toggleTag(tag.name)}
                  >
                    <Tag className="mr-1 h-4 w-4" />
                    {tag.name}
                                      <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                );
              })}
              {canCreate && (
                <CommandItem
                  value={search}
                  onSelect={handleAddTag}
                >
                  <Tag className="mr-2 h-4 w-4" />
                  Tạo tag "{search.trim()}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>

          <div className="flex gap-2 p-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCancel}
              disabled={isPending}
            >
              Huỷ
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1"
              onClick={handleConfirm}
              disabled={isPending || !hasChanges}
            >
              Xác nhận
            </Button>
          </div>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TagCombobox;