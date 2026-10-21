import { differenceInCalendarDays, differenceInCalendarMonths, differenceInCalendarWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, isToday, startOfDay, startOfWeek } from "date-fns";
import React, { useMemo } from "react";
import HourGrid from "./hour/hourGrid";
import { useWorkspaceStore } from "@/app/(front)/feature/store/workspace.state";
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


function WeekView({ currentDate,onCreateTask }: DayViewProps) {
  const days = useMemo(() => {
  const start = startOfWeek(currentDate);
  const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const colorIndex = useWorkspaceStore(useShallow((state)=>state.colorIndex))
  const taskIndex = useWorkspaceStore(useShallow((state)=>state.taskIndex))
  return (
    <div role="region" aria-label="Lịch tuần, cuộn ngang để xem các ngày" tabIndex={0} className="min-h-0 min-w-0 flex-1 overflow-x-auto overscroll-x-contain [--time-gutter:3.5rem]">
      <div className="flex h-full min-h-0 min-w-[44rem] flex-col md:min-w-[48rem]">
      <div className="grid shrink-0 grid-cols-[var(--time-gutter)_repeat(7,minmax(0,1fr))] overflow-y-auto border-b border-border/50 [scrollbar-gutter:stable]">
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

        <HourGrid tasks={Object.values(taskIndex)} type="Week" days={days} onHandle={onCreateTask!} colors={colorIndex??{}}/>
      </div>

    </div>
  );
}

export default WeekView
