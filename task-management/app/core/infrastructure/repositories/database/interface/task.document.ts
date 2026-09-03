

import { Types } from "mongoose";
import { IBaseDocument } from "./base.document";
import { IRulePopulateDocument } from "./rule.document";

export type TaskStatus = "won't do" | "done" | "pending";

export interface ITaskDocument extends IBaseDocument {
  name: string;
  section: Types.ObjectId;
  children: Types.ObjectId[];
  rule?: Types.ObjectId;
  done_at?: Date;
  list:Types.ObjectId,
  status: TaskStatus;
  path?: string;
  parent?: Types.ObjectId;
  order: number;
  description?: string;
}


export interface ITaskDocumentPopulate extends Omit<ITaskDocument,"rule"|"children"|"parent">{
  children:ITaskDocumentPopulate[],
  rule:IRulePopulateDocument,
  parent:ITaskDocumentPopulate
}