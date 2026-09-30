import { compareDate } from "@/app/(front)/utils/compareDate";
import { ICaculateDeadLine, IRepeat, IRule } from "@/app/core/domain";

export class CaculateDeadLine implements ICaculateDeadLine {
  getModeCaculateDeadLine(rule: IRule, start: Date): Date | null {
    const repeat = rule.repeat;
    switch (repeat.mode) {
      case "day":
        return this.calculateDeadlineDay(start,repeat.every ?? 1,rule.repeat.until??undefined);
      case "week":
        return this.calculateDeadlineWeek(
          start,
          repeat.every ?? 1,
          repeat.days ?? [],
          rule.repeat.until??undefined
        );
      case "month":
        return this.calculateDeadLineMonth(
          start,
          repeat.every ?? 1,
          repeat.dates ?? [],
          rule.repeat.until??undefined
        );
      case "specificday":
        return this.calculateDeadLineSpecificDay(
          repeat.specificDays ?? [],
          rule.start_date as Date,
          rule.repeat.until??undefined
        );
      default:
        return null;
    }
  }

  calculateDeadlineDay(
    deadlineCurrent: Date,
    every: number,
    end?:Date
  ): Date | null {
    const deadLine = new Date(deadlineCurrent);
    deadLine.setDate(deadLine.getDate() + every);
    return (end && compareDate(deadLine, end))?deadLine:!end?deadLine:null;
  }

  calculateDeadLineMonth(
    deadLineCurrent: Date,
    every: number,
    dates: number[],
    end?:Date,
  ): Date | null {
    if (!dates || dates.length === 0) return null;

    const next = new Date(deadLineCurrent);
    const selectedDates = [...dates].sort((a, b) => a - b);
    const currentDay = next.getDate();

    const nextDate = selectedDates.find((date) => date > currentDay);
    if (nextDate) {
      next.setDate(nextDate);
      return next;
    }

    next.setMonth(next.getMonth() + every);
    next.setDate(selectedDates[0]);
    return (end && compareDate(next, end))?next:!end?next:null;
  }

  calculateDeadLineSpecificDay(
    specificdays: Date[],
    fromDate: Date = new Date(),
    end?:Date,
  ): Date | null {
    const upcoming = specificdays
      .filter((d) => d.getTime() > fromDate.getTime())
      .sort((a, b) => a.getTime() - b.getTime());
    return  (end && compareDate( upcoming[0], end))? upcoming[0]:!end?upcoming[0]:null
  }

  calculateDeadlineWeek(
    deadlineCurrent: Date,
    every: number,
    days: number[],
    end?:Date,
  ): Date | null {
    if (!days || days.length === 0) return null;

    const selectedDays = [...days].sort((a, b) => a - b);
    const next = new Date(deadlineCurrent);
    const currentDay = next.getDay();

    const nextDayInWeek = selectedDays.find((day) => day > currentDay);
    if (nextDayInWeek !== undefined) {
      next.setDate(next.getDate() + (nextDayInWeek - currentDay));
      return (end && compareDate(next, end))? next:!end?next:null;
    }

    const firstDay = selectedDays[0];
    const daysUntilNextCycle = (7 - currentDay + firstDay) % 7 || 7;
    next.setDate(next.getDate() + daysUntilNextCycle + 7 * (every - 1));
    return (end && compareDate(next, end))? next:!end?next:null;
  }
}
