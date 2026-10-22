"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { CalendarDays, CalendarClock, Clock, Flag, Palette, SlidersHorizontal, Tag, CircleCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

interface FilterPropertyItemProps 
{
  label: string;
  value?: string | null;
  children: ReactNode;
}

const propertyIcons: Record<string, LucideIcon> = {
  "Màu filter": Palette,
  "Độ ưu tiên": Flag,
  "Thẻ": Tag,
  "Thời gian đặc biệt": Clock,
  "Trạng thái": CircleCheck,
  "Ngày bắt đầu": CalendarDays,
  "Ngày kết thúc": CalendarClock,
};

const desktopQuery = "(min-width: 640px)";
const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const getDesktopSnapshot = () => window.matchMedia(desktopQuery).matches;
const getServerSnapshot = () => false;

export function FilterPropertyItem({ label, value, children }: FilterPropertyItemProps) {
  const Icon = propertyIcons[label] ?? SlidersHorizontal;
  const [open, setOpen] = useState(false);
  const isDesktop = useSyncExternalStore(subscribe, getDesktopSnapshot, getServerSnapshot);

  if (isDesktop) return <div className="min-w-0">{children}</div>;

  return (
    <>
      <div className="max-w-full min-w-0 w-30 sm:hidden">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-9 max-w-full min-w-0 gap-2 rounded-full px-3 text-sm"
              aria-label={value ? label + ": " + value : label}
              title={label}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{value || label}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="flex h-dvh max-h-dvh w-full min-w-0 max-w-none flex-col gap-4 overflow-y-auto rounded-none sm:h-auto sm:max-h-[85dvh] sm:max-w-md sm:rounded-xl">
            <DialogHeader className="pr-8">
              <DialogTitle>{label}</DialogTitle>
              <DialogDescription>Chọn thuộc tính cho bộ lọc.</DialogDescription>
            </DialogHeader>
            <div className="min-w-0 space-y-4">{children}</div>
            <Button type="button" onClick={() => setOpen(false)}>Xong</Button>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
