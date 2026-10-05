import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema.js';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type INotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: String, required: true })
  event: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  data: Record<string, unknown>;

  @Prop({ type: Boolean, default: false })
  is_read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ user: 1, created_at: -1 });
