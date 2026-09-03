import { Types } from "mongoose";

export interface ITagWithRules {
  _id: Types.ObjectId;
  name: string;
  user: Types.ObjectId;
  isShareTag: boolean;
  updated_at: Date | null;
  deleted_at: Date | null;
  created_at: Date;
  __v: number;
  rules: Types.ObjectId[]; }