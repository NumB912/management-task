import { Schema } from "mongoose";
import { IUserDocument } from "../interface";

export const UserSchema = new Schema<IUserDocument>({
  name: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  avatar: { type: String, require: false },
  role:{type:String,Enum:["user","admin"],default:"user"},
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, require: false, default: null },
  deleted_at: { type: Date, require: false, default: null },
});
