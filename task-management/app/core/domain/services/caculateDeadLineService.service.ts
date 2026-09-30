import { IRule } from "../entities";

export interface ICaculateDeadLine {
  calculateDeadlineWeek(
    deadLineCurrent: Date,
    every: number,
    days: number[],
    end?: Date,
  ): Date | null;
  calculateDeadLineSpecificDay(specificdays: Date[], end?: Date): Date | null;
  calculateDeadLineMonth(
    deadLineCurrent: Date,
    every: number,
    dates: number[],
    end?: Date,
  ): Date | null;
  calculateDeadlineDay(
    deadlineCurrent: Date,
    every: number,
    end?: Date,
  ): Date | null;
  getModeCaculateDeadLine(rule: IRule, start: Date): Date | null;
}
