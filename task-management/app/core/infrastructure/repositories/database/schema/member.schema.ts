import { Schema } from "mongoose";
import { IMemberDocument } from "../interface";

export const MemberSchema = new Schema<IMemberDocument>({
  user: { type: Schema.Types.ObjectId, ref: "user", required: true },
  list: { type: Schema.Types.ObjectId, ref: "list", required: true },
  role: {
    type: String,
    enum: { values: ["can edit", "read only","owner"], message: "Không có quyền này" },
    default: "read only",
    required: true,
  },
  expire_at: { type: Date, required: false },
  status: {
    type: String,
    enum: {
      values: ["accept", "deny", "expired","pending"],
      message: "Không có trạng thái này",
    },
    required: true,
  },
  created_at: { type: Date, default: Date.now, required: true },
  updated_at: { type: Date, required: false },
  deleted_at: { type: Date, required: false },
});
MemberSchema.index({expire_at:1},{expireAfterSeconds:24*60*60})
MemberSchema.index({deleted_at:1},{expireAfterSeconds:24*60*60})