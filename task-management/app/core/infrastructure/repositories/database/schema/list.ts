import { Schema, Types } from "mongoose";
import { IListDocument } from "../interface";

export const ListSchema = new Schema<IListDocument>({
  name: { type: String, required: true },
  path: { type: String, required: false, default: "" },
  sections: {
    type: [{ type: Schema.Types.ObjectId, ref: "section" }],
    require: false,
  },
  members: {
    type: [{ type: Schema.Types.ObjectId, ref: "member" }],
    require: false,
  },
  isShareList:{type:Boolean,default:false},
  order: { type: Number, default: 0 },
  shared_tags: {
    type: [{
      tag:{type:String,require:true},
      created_at: { type: Date, require: false,default:Date.now },
      created_by: { type: Types.ObjectId, require: true, ref: "user" },
    }],
  },
  user: { type: Schema.Types.ObjectId, ref: "user", required: true },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, required: false, default: null },
  deleted_at: { type: Date, required: false, default: null },
});

ListSchema.index({ deleted_at: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });