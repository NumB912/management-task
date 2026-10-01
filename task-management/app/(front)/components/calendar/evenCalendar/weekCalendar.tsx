import { differenceInCalendarDays, differenceInCalendarMonths, differenceInCalendarWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, isToday, startOfDay, startOfWeek } from "date-fns";
import React, { useMemo } from "react";
import HourGrid from "./hour/hourGrid";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { useShallow } from "zustand/react/shallow";
import { formatDateVi } from "@/app/(front)/utils/getDayOfMonth.utils";
import { IRuleModel, ITaskModel } from "@/app/(front)/model";
import { compareDate } from "@/app/(front)/utils/compareDate";
interface DayViewProps {
  currentDate: Date;
   onCreateTask?: (day: Date, timer?: number) => void;
}
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