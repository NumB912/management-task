
import { Types } from "mongoose";
import { IBaseDocument } from "./base.document";

import {  ITaskDocumentPopulate } from "./task.document";

export interface ISectionDocument extends IBaseDocument {
  name: string;
  list: Types.ObjectId;
  tasks: Types.ObjectId[];
  path: string;
  order: number;
}

export interface ISectionPopulateDocument extends Omit<ISectionDocument,"tasks">{
  tasks:ITaskDocumentPopulate[];
}