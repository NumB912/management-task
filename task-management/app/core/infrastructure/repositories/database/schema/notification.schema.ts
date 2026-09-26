import { Schema } from "mongoose";

export const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  event: { type: String, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now, required: true },
  updated_at: { type: Date, required: false },
  deleted_at: { type: Date, required: false },
});


NotificationSchema.index({ user: 1, created_at: -1 });