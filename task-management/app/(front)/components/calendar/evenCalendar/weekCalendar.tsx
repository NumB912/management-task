import { eachDayOfInterval, endOfWeek, format, isToday, startOfWeek } from "date-fns";
import React, { useMemo } from "react";
import HourGrid from "./hour/hourGrid";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { useShallow } from "zustand/react/shallow";
import { formatDateVi } from "@/app/(front)/utils/getDayOfMonth.utils";
interface DayViewProps {
  currentDate: Date;
   onCreateTask?: (day: Date, timer?: number) => void;
}

function WeekView({ currentDate,onCreateTask }: DayViewProps) {
  const days = useMemo(() => {
  const start = startOfWeek(currentDate);
  const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);
  const taskIndex = useWorkspaceStore(useShallow((state)=>state.taskIndex))
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-border/50 shrink-0 pr-3.5">
        <div></div>
        {days.map((day) => {
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className="py-2.5 text-center border-l border-border/50 w-full"
            >
              <div className="text-xs font-medium text-muted-foreground">
                {formatDateVi(day, "EEEE")}
              </div>
              <div
                className={`mx-auto mt-1 text-sm w-6 h-6 flex items-center justify-center rounded-full ${
                  today
                    ? "bg-foreground text-background font-bold"
                    : "text-foreground"
                }`}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        <HourGrid tasks={Object.values(taskIndex)} type="Week" days={days} onHandle={onCreateTask!}/>
      </div>

    </div>
  );
}

export default WeekView