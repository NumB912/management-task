

import { Types } from "mongoose";
import { IBaseDocument } from "./base.document";
import { IUserWithouPasswordDocument } from "./user.document";
export interface ITagDocument extends IBaseDocument {
  name: string;
  order: number;
  user?: Types.ObjectId;
  list?: Types.ObjectId;
  isShareTag?:boolean
}

export interface ITagPopulateDocument extends Omit<ITagDocument, "user"> {
  user?: IUserWithouPasswordDocument
}

