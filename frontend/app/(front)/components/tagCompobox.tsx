"use client";
import { useEffect, useState, ReactNode, useMemo } from "react";
import { Check, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ITagModel } from "../model";
import { useWorkspaceStore } from "../feature/store/workspace.state";
import { toast } from "sonner";

export interface TagComboboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTags: string[];
  onConfirm: (tags: string[]) => void;
  onCreateTag?: (name: string) => void | Promise<void>;
  isPending?: boolean;
  trigger?: ReactNode;
  placeholder?: string;
  emptyText?: string;
  confirmText?: string;
  cancelText?: string;
  createTagText?: (search: string) => string;
  align?: "start" | "center" | "end";
  className?: string;
}

const TagCombobox = ({
  open,
  onOpenChange,
  selectedTags,
  onConfirm,
  onCreateTag,
  isPending = false,
  trigger,
  placeholder = "Tìm hoặc tạo tag...",
  emptyText = "Không tìm thấy tag.",
  confirmText = "Xác nhận",
  cancelText = "Huỷ",
  createTagText = (s) => `Tạo tag "${s}"`,
  align = "start",
  className = "w-64 p-0",
}: TagComboboxProps) => {
  const [search, setSearch] = useState("");
  const [pendingTags, setPendingTags] = useState<string[]>(selectedTags);
  const [isCreating, setIsCreating] = useState(false);
  const tagIndex = useWorkspaceStore((state) => state.tagIndex);
  const busy = isPending || isCreating;

const allTags: ITagModel[] = useMemo(
  () => Object.values(tagIndex).filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase())),
  [tagIndex, search]
);
  useEffect(() => {
    if (open) {
      setPendingTags(selectedTags);
      setSearch("");
    }
  }, [open]);

  const toggleTag = (tag: string) => {
    if (busy) return;
    setPendingTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const removeTag = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    if (busy) return;
    setPendingTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleAddTag = async () => {
    if (busy) return;
    const name = search.trim();
    if (!name || !onCreateTag) return;
    setIsCreating(true);
    try {
      await onCreateTag(name);
      setPendingTags((previous) => previous.includes(name) ? previous : [...previous, name]);
      setSearch("");
    } catch {
      toast.error("Không thể tạo thẻ. Vui lòng thử lại.");
    } finally {
      setIsCreating(false);
    }
  };

  const hasChanges =
    pendingTags.length !== selectedTags.length ||
    pendingTags.some((t) => !selectedTags.includes(t));

  const handleConfirm = () => {
    if (busy) return;
    onConfirm(pendingTags);
    onOpenChange(false)
  };

  const handleCancel = () => {
    setPendingTags(selectedTags);
    onOpenChange(false);
  };

  const filteredTags = allTags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const canCreate =
    !!onCreateTag &&
    search.trim().length > 0 &&
    !allTags.some((t) => t.name.toLowerCase() === search.trim().toLowerCase());

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        if (!next) setPendingTags(selectedTags);
        onOpenChange(next);
      }}
    >
      <DropdownMenuTrigger asChild>
        {trigger ?? <div className="h-0 w-0" />}
      </DropdownMenuTrigger>

      <DropdownMenuContent className={className} align={align}>
        <Command>
          <CommandInput
            placeholder={placeholder}
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
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {filteredTags.map((tag) => {
                const isSelected = pendingTags.includes(tag.name);
                return (
                  <CommandItem
                    disabled={busy}
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
                <CommandItem disabled={busy} value={search} onSelect={handleAddTag}>
                  <Tag className="mr-2 h-4 w-4" />
                  {createTagText(search.trim())}
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
              disabled={busy}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1"
              onClick={handleConfirm}
              disabled={busy || !hasChanges}
            >
              {confirmText}
            </Button>
          </div>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TagCombobox;
