import { Types } from "mongoose";
import { IBaseDocument } from "./base.document";
export type priority = 1 | 2 | 3 | 4;
export interface IFilterDocument extends IBaseDocument {
  name: string;
  user: Types.ObjectId;
  start_date?:Date|null,
  end_date?:Date|null,
  priority?:priority
  tags: string[];
  description:string,
  specials:"overdue"|"today"|"next 7 days"|"none",
  status:"done"|"pending"|"none"|"won't do"
}

export interface IFilterDocumentPopulated extends IFilterDocument {

}