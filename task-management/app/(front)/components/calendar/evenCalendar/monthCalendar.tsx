"use client";

import { IRuleModel, ITaskModel } from "@/app/(front)/model";
import { WEEKDAYS } from "@/app/(front)/model/mod/mod";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { getContrastText } from "@/app/(front)/utils/color";
import { compareDate } from "@/app/(front)/utils/compareDate";
import { formatTimer } from "@/app/(front)/utils/formatTimer";
import { Badge } from "@/components/ui/badge";
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { HdIcon, Router } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

const MAX_VISIBLE = 4;

type Segment = {
  task: ITaskModel;
  colSpan: number;
  index: number;
  colStart: number;
};

const checkRuleRepeat = (rule: IRuleModel, day: Date): boolean => {
  const start = startOfDay(new Date(rule.start_date!));
  const target = startOfDay(day);
  const mode = rule.repeat?.mode ?? "none";
  const every = Math.max(rule.repeat?.every ?? 1, 1);
  if (target < start) return false;
  if (mode === "none") return isSameDay(start, target);
  if (rule.repeat.until && target > startOfDay(new Date(rule.repeat.until)))
    return false;
  switch (mode) {
    case "day":
      return differenceInCalendarDays(target, start) % every === 0;
    case "month":
      const isMonth = rule.repeat?.dates?.some((v)=>{
        return v==day.getDate()
      })??false
      return isMonth && differenceInCalendarMonths(target,start)%every===0;
    case "specific":
      return (
        rule?.repeat?.specificDays?.some((v) => isSameDay(v, day)) ?? false
      );
    case "week":
      const isWeekDay = rule.repeat.days?.some((v)=>v==day.getDay())??false
      return isWeekDay && differenceInCalendarWeeks(target,start)%every===0
    default:
      break;
  }

  return false;
};

const expandForWeek = (week: Date[], tasks: ITaskModel[]): ITaskModel[] =>
  tasks.flatMap((task) => {
    const rule = task.rule;
    if (!rule?.start_date) return [];

    const mode = rule.repeat?.mode ?? "none";
    if (mode === "none") return [task]; 
    return week
      .filter((day) => checkRuleRepeat(rule, day))
      .map((day) => {
        const instanceStart = new Date(day);
        instanceStart.setHours(
          0,
          0,
          0,
        );

        return {
          ...task,
          rule: {
            ...rule,
            start_date: instanceStart,
            end_date: instanceStart, 
            repeat: { ...rule.repeat, mode: "none" as const },
          },
        };
      });
  });

const segments = (week: Date[], tasks: ITaskModel[]): Segment[] => {
  const startDayOfWeek = week[0];
  const endDayOfWeek = week[6];
  const taskPushRepeat = expandForWeek(week,tasks)
  const multiDayTasks = taskPushRepeat.filter((t) => {
    const start = t.rule?.start_date;
    const end = t.rule?.end_date ?? start;
    if (!start || !end) return false;
    return (
      compareDate(start, endDayOfWeek) &&
      new Date(start).getTime() <= new Date(end).getTime() &&
      compareDate(startDayOfWeek, end)
    );
  });

  multiDayTasks.sort((a, b) => {
    const aStart = new Date(a.rule?.start_date!).getTime();
    const bStart = new Date(b.rule?.start_date!).getTime();
    if (aStart !== bStart) return aStart - bStart;
    const aLen =
      new Date(a.rule?.end_date ?? a.rule.start_date!).getTime() - aStart;
    const bLen =
      new Date(b.rule?.end_date ?? b.rule.start_date!).getTime() - bStart;
    return bLen - aLen;
  });

  const lanes: boolean[][] = [];
  const resultArray: Segment[] = [];

  multiDayTasks.forEach((task) => {
    const start = new Date(task.rule.start_date!);
    const end = new Date(task.rule.end_date ?? task.rule.start_date!);
    const clampedEnd =
      endDayOfWeek.getTime() >= end.getTime() ? end : endDayOfWeek;
    const clampedStart =
      startDayOfWeek.getTime() <= start.getTime() ? start : startDayOfWeek;

    const colStart = week.findIndex((d) => isSameDay(d, clampedStart));
    const colEnd = week.findIndex((d) => isSameDay(d, clampedEnd));
    const colSpan = colEnd - colStart + 1;
    if (colStart === -1 || colEnd === -1) return;

    const span = colEnd - colStart + 1;
    let d = lanes.findIndex((lane) =>
      Array.from({ length: span }).every((_, i) => !lane[colStart + i]),
    );
    if (d === -1) {
      d = lanes.length;
      lanes.push(new Array(7).fill(false));
    }
    for (let i = colStart; i <= colEnd; i++) lanes[d][i] = true;

    const colSpanBool = new Array(7).fill(false);
    for (let i = colStart; i <= colEnd; i++) colSpanBool[i] = true;

    resultArray.push({ task, colSpan: colSpan, index: d, colStart });
  });
  return resultArray.sort((a, b) => a.index - b.index);
};

interface MonthViewProp {
  currentDate: Date;
  onCreateTask: (day: Date, timer?: number) => void;
}
function MonthView({ currentDate, onCreateTask }: MonthViewProp) {
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  }, [currentDate]);
  const router = useRouter();
  const taskIndex = useWorkspaceStore(useShallow((state) => state.taskIndex));
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      <div className="grid grid-cols-7 border-b border-border/50 shrink-0">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {weeks.map((week, wIdx) => {
          const segmentValues = segments(week, Object.values(taskIndex));
          const visible = segmentValues.filter((v) => v.index < MAX_VISIBLE);

          return (
            <div
              key={wIdx}
              className="grid grid-cols-7 relative border-b border-border/50 last:border-b-0 h-full"
            >
              <div className="absolute left-0 w-full top-10 grid grid-cols-7 gap-1.5 overflow-hidden z-20 pointer-events-none">
                {visible.map((value) => {
                  return (
                    <div
                      key={`${value.task.id}-${value.colStart}`}
                      className={`w-full rounded h-fit p-1 hover:bg-accent pointer-events-auto cursor-pointer flex gap-2 text-xs ${value.task.status != "pending" ? "line-through opacity-80" : ""}`}
                      style={{
                        gridColumn: `${value.colStart + 1} / span ${value.colSpan}`,
                        gridRow: value.index + 1,
                        backgroundColor: value.task.rule.color,
                        color: getContrastText(value.task.rule.color),
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/dashboard/tasks/" + value.task.id);
                      }}
                    >
                      <span>{value.task.name}</span>
                      <span>
                        {value.task.rule.timer &&
                          formatTimer(value.task.rule.timer)}

                        {value.task.rule.endTimer &&
                          ` - ${formatTimer(value.task.rule.endTimer)}`}
                      </span>

                          {value.task.rule.end_date && ( <span className="font-medium truncate"><HdIcon className="w-3 h-3"/></span>)}
                                    
                    </div>
                  );
                })}
              </div>

              {week.map((day, index) => {
                const inCurrentMonth = isSameMonth(day, currentDate);
                const today = isToday(day);
                const hiddenForThisDay = segmentValues.filter(
                  (v) =>
                    v.index >= MAX_VISIBLE &&
                    v.colStart <= index &&
                    index < v.colStart + v.colSpan,
                ).length;
                return (
                  <div
                    key={day.toISOString()}
                    className="border-r border-border/50 relative last:border-r-0 p-2 flex flex-col gap-1 min-h-50 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => onCreateTask(day)}
                  >
                    <span
                      className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                        today
                          ? "bg-foreground text-background font-bold"
                          : inCurrentMonth
                            ? "text-foreground"
                            : "text-muted-foreground/40"
                      }`}
                    >
                      {format(day, "d")}
                    </span>

                    {hiddenForThisDay > 0 && (
                      <span className="text-[10px] text-muted-foreground mt-auto z-30 relative">
                        +{hiddenForThisDay} more
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthView;
