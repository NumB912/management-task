"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const query = "(max-width: 639px)";
function subscribe(onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export default function ResponsiveCalendarPanel({
  open,
  onOpenChange,
  trigger,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
}) {
  const isSmall = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );

  if (isSmall) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild onClick={(event) => event.stopPropagation()}>
          {trigger}
        </DialogTrigger>
        <DialogContent
          aria-describedby={undefined}
          className="flex h-dvh w-full max-w-none flex-col gap-0 rounded-none p-0"
        >
          <DialogHeader className="shrink-0 border-b p-4 pr-12">
            <DialogTitle>Ngày và thời gian</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
            <div className="mx-auto w-full max-w-sm">{children}</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="left"
        collisionPadding={8}
        className="w-80 max-w-[calc(100vw-1rem)]"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
