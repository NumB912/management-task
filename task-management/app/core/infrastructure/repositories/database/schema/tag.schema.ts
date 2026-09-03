import { Schema } from "mongoose";
import { ITagDocument } from "../interface";
export const TagSchema = new Schema<ITagDocument>({
  name: { type: String, require: true },
  order:{type:Number,defaut:0},
  user:{type:Schema.Types.ObjectId,ref:"user",require:false},
  list:{type:Schema.Types.ObjectId,ref:"list",require:false},
  isShareTag:{type:Boolean,require:false,default:false},
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, require: false, default: null },
  deleted_at: { type: Date, require: false, default: null },
});

TagSchema.index({ deleted_at: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });
