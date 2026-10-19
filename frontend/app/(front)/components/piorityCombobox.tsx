"use client";
import { ReactNode, useState } from "react";
import { Check, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  PRIORITY_CONFIG,
} from "../model/mod/priorityConfig";

export interface PriorityOption {
  value: number;
  label: string;
  colorClass: string;
}
export interface PriorityDropdownProps {
  priority: number | null | undefined;
  onSelectPriority: (value: number) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  align?: "start" | "center" | "end";
}

const PriorityDropdown = ({
  priority,
  onSelectPriority,
  open: openProp,
  onOpenChange,
  trigger,
  align = "start",
}: PriorityDropdownProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const defaultTrigger = (
    <span className="p-1.5 border rounded-sm text-sm flex items-center gap-2 text-neutral-700 cursor-pointer">
      <Flag className="size-3" /> P{priority ?? 4}
    </span>
  );

  return (
    // <DropdownMenu open={open} onOpenChange={setOpen}>
    //   <DropdownMenuTrigger asChild>
    //     {trigger ?? defaultTrigger}
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent align={align}>
    //     {PRIORITY_CONFIG.map((p) => (
    //       <DropdownMenuItem
    //         key={p.value}
    //         className="flex gap-3 items-center cursor-pointer"
    //         onSelect={() => onSelectPriority(p.value)}
    //       >
    //         <Flag className={cn("size-3", p.colorClass)} />
    //         {p.label}
    //       </DropdownMenuItem>
    //     ))}
    //   </DropdownMenuContent>
    // </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <span className="p-1.5 border rounded-sm text-sm flex items-center gap-2 text-neutral-700">
                <Flag className="size-3" /> P{priority ?? 4}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {PRIORITY_CONFIG.map((p) => (
                <DropdownMenuItem
                  key={p.value}
                  className="flex gap-3 items-center cursor-pointer"
                  onSelect={() => onSelectPriority(p.value)}
                >
                  <Flag className={cn("size-3", p.colorClass)} />
                  {p.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
  );
};

export default PriorityDropdown;
