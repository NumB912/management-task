
import {IUserWithouPassword } from "./user.entity.js";
export type IRoleMember = "read only" | "can edit" |"owner";
export type IStatusMember = "accept" | "deny" |"pending";
export interface IMember {
  id: string;
  user?: IUserWithouPassword|null;
  email:string;
  role: IRoleMember;
  list:string,
  status: IStatusMember;
  expired_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface IMemberWithId extends Omit<IMember,"user">{
  user?:string|null,
}
