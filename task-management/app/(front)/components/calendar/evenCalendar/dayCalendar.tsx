"use client";

import { format, isSameDay, isToday, startOfDay } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import HourGrid from "./hour/hourGrid";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatDateVi } from "@/app/(front)/utils/getDayOfMonth.utils";

const MAX_VISIBLE = 2;

interface DayViewProps {
  currentDate: Date;
   onCreateTask: (day: Date, timer?: number) => void;
}

function DayView({ currentDate, onCreateTask }: Readonly<DayViewProps>) {
  const [expanded, setExpanded] = useState(false);
  const taskIndex = useWorkspaceStore((s) => s.taskIndex);
  const route = useRouter();
  const dayTime = startOfDay(currentDate).getTime();
  const day = useMemo(() => new Date(dayTime), [dayTime]);
  const dateTaskNow = useMemo(
    () =>
      Object.values(taskIndex).filter((task) => {
        const raw = task.rule?.start_date;
        if (!raw || task.status != "pending") return false;

        const d = new Date(raw);
        return !Number.isNaN(d.getTime()) && isSameDay(d, day);
      }),
    [taskIndex, day],
  );
  const link = useMemo(() => "/dashboard/tasks", []);
  const days = useMemo(() => [day], [day]);
  useEffect(() => {
    setExpanded(false);
  }, [dayTime]);

  const hiddenCount = Math.max(0, dateTaskNow.length - MAX_VISIBLE);
  const visibleTasks = expanded
    ? dateTaskNow
    : dateTaskNow.slice(0, MAX_VISIBLE);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="grid grid-cols-[56px_1fr] border-b border-border/50 shrink-0">
        <div />
        <div className="py-2.5 text-center border-l border-border/50">
          <div className="text-xs font-medium text-muted-foreground">
            {formatDateVi(day, "EEEE")}
          </div>
          <div
            className={`mx-auto mt-1 text-sm w-7 h-7 flex items-center justify-center rounded-full ${
              isToday(day)
                ? "bg-foreground text-background font-bold"
                : "text-foreground"
            }`}
          >
            {format(day, "d")}
          </div>
        </div>

        {dateTaskNow.length > 0 && (
          <>
            <div className="flex w-full items-start justify-center h-full">
              {hiddenCount > 0 && (
                <Button
                  variant={"outline"}
                  type="button"
                  onClick={() => setExpanded((p) => !p)}
                  className="text-xs text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-1 text-left rounded-full transition-colors"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-all ${expanded ? "rotate-180" : "rotate-0"}`}
                  />
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-0.5 border-l border-border/50 p-1 max-h-40 overflow-y-auto">
              {visibleTasks.map((task) => (
                <Badge
                  key={task.id}
                  variant="outline"
                  className="p-2 font-bold rounded w-full justify-start text-left"
                  style={{ backgroundColor: task.rule.color }}
                  onClick={() => {
                    route.push(link + `/${task.id}`);
                  }}
                >
                  <span className="truncate">{task.name}</span>
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>

      <HourGrid
        tasks={dateTaskNow}
        type="Day"
        days={days}
        onHandle={onCreateTask!}
      />
    </div>
  );
}

export default DayView;