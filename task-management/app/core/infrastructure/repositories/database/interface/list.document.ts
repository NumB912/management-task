

import { Types } from "mongoose";
import { IBaseDocument } from "./base.document";
import { ISectionPopulateDocument } from "./section.document";
import { IMemberPopulateDocument } from "./member.document";


export interface IListDocument extends IBaseDocument {
  name: string;
  path: string;
  sections: Types.ObjectId[];
  members: Types.ObjectId[];
  shared_tags: {
    tag: string
    created_at?: Date,
    created_by: Types.ObjectId,
  }[];
  isShareList:boolean,
  order: number;
  user: Types.ObjectId;
}


export interface IListPopulateDocument extends Omit<IListDocument, "sections" | "members"> {
  sections: ISectionPopulateDocument[]
  members: IMemberPopulateDocument[]
}