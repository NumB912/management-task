import { ICaculateDeadLine, IRepeat, IRule } from "@/app/core/domain";

export class CaculateDeadLine implements ICaculateDeadLine {
  getModeCaculateDeadLine(rule: IRule): Date | undefined {
    const repeat = rule.repeat;

    switch (repeat.mode) {
      case "day":
        return this.calculateDeadlineDay(rule.start_date as Date, repeat.every ?? 1);
      case "week":
        return this.calculateDeadlineWeek(rule.start_date as Date, repeat.every ?? 1, repeat.days ?? []);
      case "month":
        return this.calculateDeadLineMonth(rule.start_date as Date, repeat.every ?? 1, repeat.dates ?? []);
      case "specific":
        return this.calculateDeadLineSpecificDay(repeat.specificDays ?? [], rule.start_date as Date);
      default:
        return undefined;
    }
  }

  calculateDeadlineDay(deadlineCurrent: Date, every: number): Date {
    const deadLine = new Date(deadlineCurrent);
    deadLine.setDate(deadLine.getDate() + every);
    return deadLine;
  }

  calculateDeadLineMonth(deadLineCurrent: Date, every: number, dates: number[]): Date | undefined {
    if (!dates || dates.length === 0) return undefined;

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
    return next;
  }

  calculateDeadLineSpecificDay(specificdays: Date[], fromDate: Date = new Date()): Date | undefined {
    const upcoming = specificdays
      .filter((d) => d.getTime() > fromDate.getTime())
      .sort((a, b) => a.getTime() - b.getTime());
    return upcoming[0];
  }

  calculateDeadlineWeek(deadlineCurrent: Date, every: number, days: number[]): Date | undefined {
    if (!days || days.length === 0) return undefined;

    const selectedDays = [...days].sort((a, b) => a - b);
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