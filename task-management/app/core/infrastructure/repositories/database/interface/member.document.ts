
import { Types } from "mongoose";
import { IBaseDocument } from "./base.document";
import { IUserWithouPasswordDocument } from "./user.document";
export type MemberRole = "can edit" | "read only";
export type MemberStatus = "accept" | "deny" | "pending";
export interface IMemberDocument extends IBaseDocument {
  user: Types.ObjectId;
  list: Types.ObjectId;
  role: MemberRole;
  status: MemberStatus;
  expire_at: Date;
}
export interface IMemberPopulateDocument extends Omit<IMemberDocument,"user">{
  user:IUserWithouPasswordDocument,
}