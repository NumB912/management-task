import { Schema, Types } from "mongoose";
import { IPromodoDocument } from "../interface/promodo.document";
export const PromodoSchema = new Schema<IPromodoDocument>({
    name: { type: String, require: true },
    task: {type: Types.ObjectId, require: false, ref: "task"},
    start: { type: Date, require: true },
    duration: { type: Number, require: true },
    progress:[ {
        startPause:{ type: Date, require: true,default:new Date() },
        duration:{type:Number,require:true,default:0}
    }],
    user:{type:Types.ObjectId,require:true},
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, require: false, default: null },
    deleted_at: { type: Date, require: false, default: null },
});