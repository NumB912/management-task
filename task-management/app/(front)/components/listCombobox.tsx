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
import { IListModelState } from "@/app/(front)/model";
import { useWorkspaceStore } from "../states/workspace.state";
import { useShallow } from "zustand/react/shallow";

export interface ListPickerSelection {
  list: string;
  section?: string;
}

interface ListPickerProps {
  selectedList: string;
  selectedSection?: string| null;
  onSelect: (selection: ListPickerSelection) => void;
  className?: string;
  contentClassName?: string;
}

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

  if (!section) return null; 
  return (
    <DropdownMenuItem
      className="flex gap-3 items-center cursor-pointer rounded-none p-2 border-b"
      onSelect={() => onSelect({ list:list.id,section:sectionId})}
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
  selectedSectionId?: string|null;
  onSelect: (selection: ListPickerSelection) => void;
}) {
  const hasSections = list.sections && list.sections.length > 0;

  if (!hasSections) {
    return (
      <DropdownMenuItem
        className="flex gap-3 items-center cursor-pointer p-2 rounded-none!"
        onSelect={() => onSelect({ list:list.id })}
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
          "flex gap-3 items-center cursor-pointer p-2 rounded-none",
          isListSelected && "text-primary",
        )}
        onSelect={() => onSelect({ list:list.id })}
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
  selectedList,
  selectedSection,
  onSelect,
  className,
  contentClassName,
}: Readonly<ListPickerProps>) {
  const lists = useWorkspaceStore(useShallow((state)=>state.listIndex))
  const sections = useWorkspaceStore(useShallow((state)=>state.sectionIndex))
  const label = lists[selectedList]?.name.toLocaleLowerCase() === "inbox"
      ? "Hộp thư"
      : (lists[selectedList]?.name ?? "Chọn danh sách");

  const selectedSectionData = selectedSection
    ? sections[selectedSection]
    : undefined;
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
            {selectedSectionData ? ` / ${selectedSectionData.name}` : ""}
          </span>
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn("max-h-50 min-w-50 p-0 rounded-md!", contentClassName)}
      >
        {Object.values(lists).map((list) => (
          <ListRow
            key={list.id}
            list={list}
            isListSelected={selectedList === list.id}
            selectedSectionId={selectedSection}
            onSelect={onSelect}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default memo(ListPicker);