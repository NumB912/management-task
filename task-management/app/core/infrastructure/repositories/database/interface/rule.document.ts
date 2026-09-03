
import { Types } from "mongoose";
import { IBaseDocument } from "./base.document";

export type RepeatMode = "week" | "day" | "none" | "month" | "specificday";
export type RulePriority = 1 | 2 | 3 | 4;

export interface IRepeatSubdocument {
  mode: string;
  every?: number;
  dates?: number[];
  days?: number[];
  specificDays?: Date[];
}

export interface IRuleDocument extends IBaseDocument {
  start_date?: Date;
  end_date?: Date;
  path: string;
  priority: RulePriority;
  list:Types.ObjectId,
  repeat: IRepeatSubdocument;
  tags: string[];
  timer?: string;
  task?: Types.ObjectId;
}

export interface IRulePopulateDocument extends IRuleDocument {

}
