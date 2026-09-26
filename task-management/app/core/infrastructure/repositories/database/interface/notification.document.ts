
import { Types } from "mongoose";
import { IBaseDocument } from "./base.document";
export interface INotificationDocument extends IBaseDocument {
  user: Types.ObjectId;
  event: string;
  data: Record<string, unknown>;
  is_read: boolean;
}