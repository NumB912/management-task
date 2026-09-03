

import { Types, Document } from "mongoose";

export interface IBaseDocument extends Partial<Document> {
  _id: Types.ObjectId;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}
