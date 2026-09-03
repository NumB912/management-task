import { Types } from "mongoose";
import { IBaseDocument } from "./base.document";
export interface IPromodoDocument extends IBaseDocument {
  name: string;
  task:Types.ObjectId,
  end:Date,
  start:Date,
  duration:number,
}

export interface IPromodoDocumentPopulate extends IPromodoDocument {

}