import { Schema } from "mongoose";
import { IFilterDocument } from "../interface";

export const FilterSchema = new Schema<IFilterDocument>({
  name: { type: String, require: true },
  tags: { type: [{ type: String}],required: true},
  user: { type: Schema.Types.ObjectId, ref: "user" },
  start_date:{type:Date,require:false},
  end_date:{type:Date,require:false},
  priority: { type: Number, enum: { values: [1, 2, 3, 4], message: "Lỗi không được lấy dữ liệu vượt qua từ 1-4" }, default: 1 },
  specials:{type:String,enum:{values:["overdue","none","today","next 7 days"],message:"Lỗi không tồn tại theo dữ liệu mẫu"},default:"none"},
  status:{type:String,enum:{values:["done","pending","none","won't do"],message:"Lỗi không tồn tại theo dữ liệu mẫu"},default:"none"},
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, require: false, default: null },
  deleted_at: { type: Date, require: false, default: null },
});

FilterSchema.index({ deleted_at: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });
