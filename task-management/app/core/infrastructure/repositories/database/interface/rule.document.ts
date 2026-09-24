
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
  until?:Date|null
}

export interface IRuleDocument extends IBaseDocument {
  start_date?: Date|null;
  end_date?: Date|null;
  path: string;
  priority: RulePriority;
  list:Types.ObjectId,
  repeat: IRepeatSubdocument;
  tags: string[];
  color:string;
  timer?: number|null;
  endTimer?:number|null;
  task?: Types.ObjectId;
}

export interface IRulePopulateDocument extends IRuleDocument {

}
