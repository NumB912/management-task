import { Types } from "mongoose";
import { IBaseDocument } from "./base.document";
import { ITaskDocument } from "./task.document";
export interface IPromodoDocument extends IBaseDocument {
  name: string;
  task?:Types.ObjectId,
    progress:{
        startPause:Date,
        duration:number
    }[]
  start:Date,
  user:Types.ObjectId,
}

export interface IPromodoDocumentPopulate extends Omit<IPromodoDocument,"task"> {
    task?:Pick<ITaskDocument,"_id"|"name">,
}