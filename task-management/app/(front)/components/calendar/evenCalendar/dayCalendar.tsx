
import { format, isToday } from "date-fns";
import React from "react";
import HourGrid from "./hour/hourGrid";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";

function DayView({ currentDate }: Readonly<{ currentDate: Date }>) {
const {listIndex} = useWorkspaceStore()
  const task = Object.values(listIndex).flatMap(
    (list) => list.list.sections?.flatMap((section) => section.tasks) ?? []
  )
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="grid grid-cols-[56px_1fr] border-b border-border/50 shrink-0">
        <div />
        <div className="py-2.5 text-center border-l border-border/50">
          <div className="text-xs font-medium text-muted-foreground">
            {format(currentDate, "EEEE")}
          </div>
          <div
            className={`mx-auto mt-1 text-sm w-7 h-7 flex items-center justify-center rounded-full ${
              isToday(currentDate)
                ? "bg-foreground text-background font-bold"
                : "text-foreground"
            }`}
          >
            {format(currentDate, "d")}
          </div>
        </div>
      </div>
        <HourGrid tasks={task} type="Day" days={[currentDate]}/>
    </div>
  );
}


export default DayView