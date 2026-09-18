import { eachDayOfInterval, endOfWeek, format, isToday, startOfWeek } from "date-fns";
import React, { useMemo } from "react";
import HourGrid from "./hour/hourGrid";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";

function WeekView({ currentDate }: Readonly<{ currentDate: Date }>) {
  const days = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);
const {listIndex} = useWorkspaceStore()
  const task = Object.values(listIndex).flatMap(
    (list) => list.list.sections?.flatMap((section) => section.tasks) ?? []
  )
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
                {format(day, "EEE")}
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
        <HourGrid tasks={task} type="Week" days={days}/>
      </div>

    </div>
  );
}

export default WeekView