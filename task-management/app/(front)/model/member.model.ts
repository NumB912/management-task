import { IUserModel } from "./user.model";
export type IRole = "read only" | "can edit" |"owner";
export type IStatusMember = "accept" | "deny" |"pending";
export interface IMemberModel {
  id: string;
  user: IUserModel;
  role: IRole;
  list:string,
  status: IStatusMember;
  expired_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}