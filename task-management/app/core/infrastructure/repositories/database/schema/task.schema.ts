
import mongoose, {Schema } from "mongoose";
import { ITaskDocument } from "../interface";
export const TaskSchema = new Schema<ITaskDocument>({
  name: { type: String },
  section: { type: Schema.Types.ObjectId, require: true,ref:"section" },
  children: {
    type: [{ type: Schema.Types.ObjectId, ref: "task" }],
    require: false,
  },
  list:{type:Schema.Types.ObjectId,require:true,ref:"list"},
  rule: { type: Schema.Types.ObjectId, require: false, ref: "rule" },
  done_at:{type:Date,require:false},
  status:{type:String,enum:["won't do","done","pending"],default:'pending'},
  path: { type: String, require: false },
  parent: { type: mongoose.Types.ObjectId, require: false, ref: "task" },
  order:{type:Number,default:0},
  description: { type: String, require: false },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, require: false, default: null },
  deleted_at: { type: Date, require: false, default: null },
});

TaskSchema.index({ deleted_at: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });