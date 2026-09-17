// app/(front)/components/listPicker.component.tsx
"use client";

import { memo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/app/(front)/components/ui/dropdown-menu";
import { Folder, File, InboxIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { IListModel, IListModelState, ISectionModel } from "@/app/(front)/model";
import { useWorkspaceStore } from "../states/workspace.state";

export interface ListPickerSelection {
  list: Pick<IListModelState, "id" | "name">;
  section?: ISectionModel;
}

interface ListPickerProps {
  lists: Pick<IListModelState, "id" | "name" | "sections">[];
  selectedList?: Pick<IListModel, "id" | "name"> | null;
  selectedSection?: Pick<ISectionModel, "id" | "name"> | null;
  onSelect: (selection: ListPickerSelection) => void;
  className?: string;
  contentClassName?: string;
}

// ── Sub-component: 1 dòng section trong submenu ──
// Chỉ subscribe đúng 1 section theo id → không re-render khi section KHÁC đổi
const SectionRow = memo(function SectionRow({
  sectionId,
  list,
  isSelected,
  onSelect,
}: {
  sectionId: string;
  list: Pick<IListModelState, "id" | "name">;
  isSelected: boolean;
  onSelect: (selection: ListPickerSelection) => void;
}) {
  const section = useWorkspaceStore((state) => state.sectionIndex[sectionId]);

  if (!section) return null; // ✅ guard — section có thể đã bị xóa nhưng list.sections chưa kịp đồng bộ

  return (
    <DropdownMenuItem
      className="flex gap-3 items-center cursor-pointer rounded-none p-2 border-b"
      onSelect={() => onSelect({ list, section })}
    >
      <File className="size-3 ml-3" />
      <span className="flex-1">{section.name}</span>
      {isSelected && <Check className="size-3.5 text-neutral-700" />}
    </DropdownMenuItem>
  );
});


const ListRow = memo(function ListRow({
  list,
  isListSelected,
  selectedSectionId,
  onSelect,
}: {
  list: Pick<IListModelState, "id" | "name" | "sections">;
  isListSelected: boolean;
  selectedSectionId?: string;
  onSelect: (selection: ListPickerSelection) => void;
}) {
  const hasSections = list.sections && list.sections.length > 0;

  if (!hasSections) {
    return (
      <DropdownMenuItem
        className="flex gap-3 items-center cursor-pointer border-b p-2 rounded-none!"
        onSelect={() => onSelect({ list })}
      >
        <Folder className="size-3" />
        <span className="flex-1">{list.name}</span>
        {isListSelected && <Check className="size-3.5 text-neutral-700" />}
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        className={cn(
          "flex gap-3 items-center cursor-pointer border-b p-2 rounded-none",
          isListSelected && "text-primary",
        )}
        onSelect={() => onSelect({ list })}
        isIcon={isListSelected}
      >
        <Folder className="size-3" />
        <span className="flex-1">{list.name}</span>
        {isListSelected && <Check className="size-3.5" />}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="min-w-40 p-0 rounded-md">
          {list.sections!.map((sectionId) => (
            <SectionRow
              key={sectionId}
              sectionId={sectionId}
              list={list}
              isSelected={isListSelected && selectedSectionId === sectionId}
              onSelect={onSelect}
            />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
});

function ListPicker({
  lists,
  selectedList,
  selectedSection,
  onSelect,
  className,
  contentClassName,
}: Readonly<ListPickerProps>) {
  const label =
    selectedList?.name.toLocaleLowerCase() === "inbox"
      ? "Hộp thư"
      : (selectedList?.name ?? "Chọn danh sách");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span
          className={cn(
            "p-1.5 border rounded-md text-sm flex items-center gap-2 text-neutral-700",
            className,
          )}
        >
          <InboxIcon className="size-3" />
          <span className="text-sm">
            {label}
            {selectedSection ? ` / ${selectedSection.name}` : ""}
          </span>
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn("max-h-50 min-w-50 p-0 rounded-md!", contentClassName)}
      >
        {lists.map((list) => (
          <ListRow
            key={list.id}
            list={list}
            isListSelected={selectedList?.id === list.id}
            selectedSectionId={selectedSection?.id}
            onSelect={onSelect}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default memo(ListPicker);