import { Schema, Types, HydratedDocument } from "mongoose";
import { IRuleDocument } from "../interface";
export const RuleSchema = new Schema<IRuleDocument>({
  start_date: { type: Date, required: false },
  end_date: { type: Date, required: false },
  path: { type: String, require: true },
  priority: { type: Number, enum: { values: [1, 2, 3, 4], message: "Lỗi không được lấy dữ liệu vượt qua từ 1-4" }, default: 4 },
  list: { type: Types.ObjectId, require: true, ref: "list" },
  repeat: {
    type: new Schema(
      {
        mode: {
          type: String,
          enum: { values: ["week", "day", "none", "month", "specificday"], message: "Không tồn tại giá trị này" },
          default: "none",
        },
        every: { type: Number, default: 0 },
        dates: {
          type: [Number],
          required: false,
          validate: {
            validator: (dates: number[]) =>
              dates.every((date) => date > 0 && date <= 31),
            message: "Days phải thuộc từ ngày 1-31",
          },
        },
        days: {
          type: [Number], validator: (dates: number[]) =>
            dates.every((date) => date > 0 && date <= 31),
          message: "Date phải thuộc từ ngày 0-7", require: false, length: 7
        },
        specificDays: { type: [Date], require: false },
      },
      { _id: false }
    ),
    default: { mode: "none" },
    required: false,
  },
  tags: { type: [{ type: String, required: true }] },
  timer: {
    type: Number,
    min: [0, "endTimer phải từ 0 đến 86400"],
    max: [86400, "endTimer phải từ 0 đến 86400"],
    required: false,
  },
  endTimer: {
    type: Number,
    required: false,
    min: [0, "endTimer phải từ 0 đến 86400"],
    max: [86400, "endTimer phải từ 0 đến 86400"],
  },
  color: {
    type: String,
    required: true
  },
  task: { type: Schema.Types.ObjectId, required: false, ref: "task" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, required: false, default: null },
  deleted_at: { type: Date, require: false, default: null }
});

RuleSchema.index({ deleted_at: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 })