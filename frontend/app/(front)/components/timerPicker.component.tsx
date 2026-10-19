"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TIME_OPTIONS } from "@/app/(front)/utils/timeOption.utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type TimeOption = { title: string | null; value: number };

export interface TimeRangeValue {
  timer: number | null;
  endTimer: number | null;
}

const titleOf = (value: number | null | undefined): string | null =>
  value == null
    ? null
    : (TIME_OPTIONS.find((o: TimeOption) => o.value === value)?.title ?? null);
interface TimeSelectProps {
  title: string;
  value: number | null | undefined;
  options: TimeOption[];
  placeholder: string;
  clearLabel?: string;
  onSelect: (value: number) => void;
  onClear?: () => void;
  autoOpenSignal?: number;
}

function TimeSelect({
  title,
  value,
  options,
  placeholder,
  clearLabel,
  onSelect,
  onClear,
  autoOpenSignal,
}: Readonly<TimeSelectProps>) {
  const [open, setOpen] = useState(false);
  const activeRef = useRef<HTMLButtonElement>(null);
  const text = titleOf(value);
  const canClear = value != null && !!onClear;

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() =>
        activeRef.current?.scrollIntoView({ block: "center" }),
      );
    }
  }, [open]);

  useEffect(() => {
    if (autoOpenSignal) setOpen(true);
  }, [autoOpenSignal]);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 w-full">
      <span className="px-1 text-xs text-muted-foreground">{title}</span>
      <div className="group relative">
        <Popover open={open} onOpenChange={setOpen} modal>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              type="button"
              title={title}
              className={cn(
                "flex flex-1 items-center w-full justify-start gap-2 rounded-md! px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                value == null && "text-muted-foreground",
                canClear && "pr-8",
                open && "border-primary",
              )}
            >
              <span className="block truncate">{text ?? placeholder}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            sideOffset={6}
            style={{ zIndex: 70 }}
            className="max-h-56 w-40 overflow-y-auto p-1 z-110"
          >
            {canClear && clearLabel && (
              <Button
                type="button"
                onClick={() => {
                  onClear!();
                  setOpen(false);
                }}
                className="w-full rounded px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent"
              >
                {clearLabel}
              </Button>
            )}

            {options.length === 0 && (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                Không có mốc phù hợp
              </p>
            )}

            {options.map((o) => {
              const active = o.value === value;
              return (
                <button
                  key={o.value}
                  ref={active ? activeRef : undefined}
                  type="button"
                  onClick={() => {
                    onSelect(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full rounded px-2 py-1.5 text-left text-sm transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent",
                  )}
                >
                  {o.title ?? o.value}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>

        {canClear && (
          <button
            type="button"
            aria-label={`Xóa ${title.toLowerCase()}`}
            onClick={(e) => {
              e.stopPropagation();
              onClear?.();
            }}
            className={cn(
              "absolute right-1.5 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full",
              "text-muted-foreground hover:bg-accent hover:text-foreground",
              "group-hover:flex group-focus-within:flex",
            )}
          >
            <X className="h-3.5 w-3.5 shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}

interface TimeRangePickerProps {
  timer: number | null | undefined;
  endTimer: number | null | undefined;
  onChange: (value: TimeRangeValue) => void;
  autoOpenEnd?: boolean;
  className?: string;
}

export function TimeRangePicker({
  timer,
  endTimer,
  onChange,
  autoOpenEnd = true,
  className,
}: Readonly<TimeRangePickerProps>) {
  const [open, setOpen] = useState(false);
  const [openEndSignal, setOpenEndSignal] = useState(0);
  const hasStart = timer != null;
  const startTitle = titleOf(timer);
  const endTitle = titleOf(endTimer);
  const label = hasStart
    ? endTitle
      ? `${startTitle} - ${endTitle}`
      : `${startTitle}`
    : "Chọn thời gian";

  const endOptions: TimeOption[] =
    timer == null
      ? []
      : TIME_OPTIONS.filter((o: TimeOption) => o.value > timer);

  const handleStart = (value: number) => {
    const firstTime = timer == null;
    onChange({
      timer: value,
      endTimer:
        endTimer != null && endTimer <= value ? null : (endTimer ?? null),
    });
    if (autoOpenEnd && firstTime) setOpenEndSignal((n) => n + 1);
  };
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <DropdownMenu open={open} onOpenChange={(p) => setOpen(p)}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            aria-expanded={open}
            variant={"outline"}
            className={cn(
              "flex flex-1 items-center justify-start gap-2 rounded-md! px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
              !hasStart && "text-muted-foreground",
              open && "border-primary",
            )}
          >
            <Clock className="h-5 w-5 shrink-0" />
            <span className="truncate">{label}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          className="flex flex-col items-center gap-2 rounded-md border p-2 z-60"
        >
          <TimeSelect
            title="Bắt đầu"
            value={timer}
            options={TIME_OPTIONS}
            placeholder="Bắt đầu"
            onSelect={handleStart}
            onClear={() => onChange({ timer: null, endTimer: null })}
          />
          {hasStart && (
            <TimeSelect
              title="kết thúc"
              value={endTimer}
              options={endOptions}
              placeholder="Kết thúc"
              clearLabel="Không có giờ kết thúc"
              onSelect={(v) => onChange({ timer, endTimer: v })}
              onClear={() => onChange({ timer, endTimer: null })}
              autoOpenSignal={openEndSignal}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default TimeRangePicker;
