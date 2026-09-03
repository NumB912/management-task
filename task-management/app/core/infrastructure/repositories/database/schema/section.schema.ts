import {Schema } from "mongoose";
import { ISectionDocument } from "../interface";

export const SectionSchema = new Schema<ISectionDocument>({
  name: { type: String, required: true },
  list: { type: Schema.Types.ObjectId,ref:"list", required: true },
  tasks: {
    type: [{ type: Schema.Types.ObjectId, ref: "task" }],
    required: false,
  },
  path:{type:String,required:true},
  order:{type:Number,default:0,required:true},
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, required: false,default:null  },
  deleted_at:{type:Date,required:false,default:null }
});

SectionSchema.index({deleted_at:1},{expireAfterSeconds:3*24*60*60})