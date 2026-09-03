import { ICaculateDeadLine, IRepeat, IRule } from "@/app/core/domain";

export class CaculateDeadLine implements ICaculateDeadLine {
  getModeCaculateDeadLine(rule: IRule): Date|undefined {
    const repeat = rule.repeat

    switch (repeat.mode) {
      case "day":
        return this.calculateDeadlineDay(rule.start_date as Date,repeat.every??1);
      case "week":
        return this.calculateDeadlineWeek(rule.start_date as Date,repeat.every??1, repeat.days as number[]);
      case "month":
        return this.calculateDeadLineMonth(rule.start_date as Date,repeat.every??1,repeat.dates as number[]);
      case "specificday":
        return this.calculateDeadLineSpecificDay(repeat.specificDays??[]);
    }
  }
  calculateDeadlineDay(deadlineCurrent: Date, every: number) {
    const deadLine = new Date(deadlineCurrent);
    deadLine.setDate(deadLine.getDate()+every)
    return deadLine;
  }
calculateDeadLineMonth(
  deadLineCurrent: Date,
  every: number,
  dates: number[]
): Date {
  const next = new Date(deadLineCurrent);

  const selectedDates = dates
    .map((active, index) => (active ? index + 1 : undefined))
    .filter((value): value is number => value !== undefined);

  if (selectedDates.length === 0) throw new Error("No dates selected");

  const nextDate = selectedDates.find((date) => date > next.getDate());
  if (nextDate) {
    next.setDate(nextDate);
    return next;
  }


  next.setMonth(next.getMonth() + every);
  next.setDate(selectedDates[0]); 
  return next;
}

  calculateDeadLineSpecificDay(specificdays: Date[]) {
    const nextDeadLine = [...specificdays].sort(
      (a, b) => a.getTime() - b.getTime(),
    )[0];

    return nextDeadLine;
  }
calculateDeadlineWeek(deadlineCurrent: Date, every: number, days: number[]): Date |undefined{
  const selectedDays = days
    .map((active, index) => (active ? index : undefined))
    .filter((value): value is number => value !== undefined);

  if (selectedDays.length === 0) return undefined;

  const next = new Date(deadlineCurrent);
  const currentDay = next.getDay();

  const nextDayInWeek = selectedDays.find((day) => day > currentDay);

  if (nextDayInWeek !== undefined) {
    next.setDate(next.getDate() + (nextDayInWeek - currentDay));
    return next;
  }

  const firstDay = selectedDays[0];
  const daysUntilNextCycle = (7 - currentDay + firstDay) % 7 || 7;
  next.setDate(next.getDate() + daysUntilNextCycle + 7 * (every - 1));

  return next;
}
}
