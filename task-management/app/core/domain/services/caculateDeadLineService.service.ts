import {IRule } from "../entities";

export interface ICaculateDeadLine {
  calculateDeadlineWeek(
    deadLineCurrent: Date,
    every: number,
    days: number[],
  ): Date|undefined;
  calculateDeadLineSpecificDay(specificdays: Date[]): Date|undefined;
  calculateDeadLineMonth(
    deadLineCurrent: Date,
    every: number,
    dates: number[],
  ): Date|undefined;
  calculateDeadlineDay(deadlineCurrent: Date, every: number): Date|undefined;
  getModeCaculateDeadLine(rule:IRule):Date|undefined
}
