import { ITaskModel } from "@/app/(front)/model";
import { HOURS } from "@/app/(front)/model/mod/mod";
import React, { useMemo } from "react";

interface HourGridProp {
  tasks: ITaskModel[];
  type: "Day" | "Week";
  days?: Date[];
}

const HOUR_HEIGHT = 56;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isContain = (task: ITaskModel, taskOther: ITaskModel) => {
  const tasksStart = task.rule?.timer ?? 0;
  const tasksEnd = task.rule?.endTimer ?? 0;
  const otherStart = taskOther.rule?.timer ?? 0;
  const otherEnd = taskOther.rule?.endTimer ?? 0;
  return tasksStart <= otherEnd && tasksEnd > otherStart;
};

const getPositions = (dayTasks: ITaskModel[]) => {
  const result: { index: number; task: ITaskModel }[] = [];
  const taskTemp = dayTasks.map((task) => ({ task }));
  taskTemp.sort(
    (a, b) => (a.task.rule?.timer ?? 0) - (b.task.rule?.timer ?? 0),
  );

  const length = taskTemp.length;
  for (let i = 0; i < length; i++) {
    if (i === 0) {
      result.push({ index: 0, task: taskTemp[i].task });
      continue;
    }
    const prev = result[result.length - 1];
    if (isContain(taskTemp[i - 1].task, taskTemp[i].task)) {
      result.push({ index: prev.index + 1, task: taskTemp[i].task });
    } else {
      result.push({ index: 0, task: taskTemp[i].task });
    }
  }
  return result;
};

const getTaskStyle = (task: ITaskModel, firstHour: number) => {
  const rule = (task as any).rule;
  if (rule?.timer == null || rule.endTimer == null) return null;

  const startSec = rule.timer;
  const endSec = rule.endTimer;

  const top = (startSec / 3600 - firstHour) * HOUR_HEIGHT;
  const height = Math.max(((endSec - startSec) / 3600) * HOUR_HEIGHT, 18);

  return { top, height };
};

const addTaskDay = (day:Date,hour:number)=>{
  console.log(day,hour)

}


const addTaskWeek = (day:Date,hour:number)=>{
  console.log(day,hour)
}

const buildAddTask = (type: HourGridProp["type"], day?: Date, hour?: number) => {
  if (!day || hour == null) return;

  if (type === "Day") {
    return addTaskDay(day, hour);
  }

  if (type === "Week") {
    return addTaskWeek(day, hour);
  }
};

const HourGrid = ({ tasks, type = "Day", days }: HourGridProp) => {
  const firstHour = HOURS[0];
  const totalHeight = HOURS.length * HOUR_HEIGHT;
  const safeDays = days ?? [];
  const columns: { date?: Date; tasks: ITaskModel[] }[] = useMemo(() => {
    if (type === "Day") {
      return [{ date: safeDays[0], tasks }];
    }
    return safeDays.map((date) => ({
      date,
      tasks: tasks.filter(
        (t) => (t as any).date && isSameDay(new Date((t as any).date), date),
      ),
    }));
  }, [tasks, type, safeDays]);

  const columnPositions = useMemo(
    () => columns.map((col) => getPositions(col.tasks)),
    [columns],
  );

  const gridColsClass =
    type === "Week" ? "grid-cols-[56px_repeat(7,1fr)]" : "grid-cols-[56px_1fr]";
  return (
    <div className="flex-1 overflow-y-auto min-h-0 h-full">
      <div className={`grid ${gridColsClass} relative`}>
        {HOURS.map((hour) => (
          <React.Fragment key={hour}>
            <div className="text-[10px] text-muted-foreground text-right pr-2 pt-1 border-t border-border/30 h-14">
              {hour === 0
                ? ""
                : `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? "am" : "pm"}`}
            </div>
            {columns.map((col, colIdx) => (
              <div
                key={col.date ? `${col.date.toISOString()}-${hour}` : hour}
                onClick={() => {

               buildAddTask(type,col.date,hour)
                }}
                className="border-t border-l border-border/30 h-14 hover:bg-muted/20 z-20 transition-colors cursor-pointer relative"
              />
            ))}
          </React.Fragment>
        ))}

        {columns.map((col, colIdx) => (
          <div
            key={col.date ? col.date.toISOString() : "day"}
            className="absolute top-0"
            style={{
              height: totalHeight,
              left:
                type === "Week"
                  ? `calc(56px + ${colIdx} * ((100% - 56px) / 7))`
                  : "56px",
              width:
                type === "Week"
                  ? `calc((100% - 56px) / 7)`
                  : "calc(100% - 56px)",
            }}
          >
            {columnPositions[colIdx].map((position) => {
              const style = getTaskStyle(position.task, firstHour);
              if (!style) return null;

              return (
                <div
                  key={position.task.id}
                  className="absolute rounded-md px-2 py-1 text-[11px] text-white overflow-hidden shadow-sm cursor-pointer z-30"
                  style={{
                    top: style.top,
                    height: style.height,
                    backgroundColor:
                      (position.task as any).rule?.color ?? "#3B82F6",
                    left: position.index * 70,
                    right: type === "Week" ? undefined : 4,
                    width: type === "Week" ? "calc(100% - 8px)" : undefined,
                  }}
                  title={position.task.name}
                >
                  <span className="font-medium truncate block">
                    {position.task.name}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourGrid;
