

import { IBaseDocument } from "./base.document";

export type UserRole = "user" | "admin";

export interface IUserDocument extends IBaseDocument {
  name: string;
  email: string;
  order:number;
  path:string;
  password: string; 
  avatar?: string;
  role: UserRole;
}

export interface IUserWithouPasswordDocument extends Omit<IUserDocument,"password">{
}
