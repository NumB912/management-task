
import dayjs from "dayjs";
import { ITaskModel } from "../model";


export const getNextOccurrence = (task: ITaskModel):{
  next: Date | null;
  isEnded: boolean;
}=> {
  const { rule } = task;
  if (!rule?.start_date || rule.repeat.mode === "none") return {
    isEnded: true,
    next: null
  };

  const next = calculateNextDate(rule?.repeat, rule.start_date);
  if (!next) return {
    isEnded: true,
    next: null
  };
  if (rule.repeat.until && new Date(next) >= new Date(rule.repeat.until)) return {
    next: next,
    isEnded: true,
  };
  return {
    next:next,
    isEnded: rule.repeat.until ? new Date(next) >= new Date(rule.repeat.until) : false,
  };
};

export const calculateNextDate = (repeat: NonNullable<ITaskModel["rule"]>["repeat"], fromDate: Date): Date | null => {
  const base = dayjs(fromDate);
  const every = repeat.every ?? 1;

  switch (repeat.mode) {
    case "none":
      return null;
    case "day":
      return base.add(every, "day").toDate();
    case "week": {
      if (!repeat.days || repeat.days.length === 0) {
        return base.add(every, "week").toDate();
      }
      
      const sortedDays = [...repeat.days].sort((a, b) => a - b);
      const currentDayOfWeek = base.day(); 
      const nextDayThisWeek = sortedDays.find((d) => d > currentDayOfWeek);
      if (nextDayThisWeek !== undefined) {
        return base.add(nextDayThisWeek - currentDayOfWeek, "day").toDate();
      }
      const daysUntilNextCycle = (every - 1) * 7 + (7 - currentDayOfWeek + sortedDays[0]);
      return base.add(daysUntilNextCycle, "day").toDate();
    }
    case "month": {
      if (!repeat.dates || repeat.dates.length === 0) {
        return base.add(every, "month").toDate();
      }
      const sortedDates = [...repeat.dates].sort((a, b) => a - b);
      const currentDay = base.date();
      const nextDateThisMonth = sortedDates.find((d) => d > currentDay);
      if (nextDateThisMonth) {
        return base.date(nextDateThisMonth).toDate();
      }
      return base.add(every, "month").date(sortedDates[0]).toDate();
    }

    case "specific": {
      if (!repeat.specificDays || repeat.specificDays.length === 0) return null;

      const sorted = [...repeat.specificDays]
        .map((d) => dayjs(d))
        .sort((a, b) => a.valueOf() - b.valueOf());

      const next = sorted.find((d) => d.isAfter(base));
      return next ? next.toDate() : null; 
    }

    default:
      return null;
  }
};