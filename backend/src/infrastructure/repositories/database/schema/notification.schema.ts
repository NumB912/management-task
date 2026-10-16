import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema.js';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type INotificationDocument = HydratedDocument<Notification>;
@Schema({ _id: false, strict: false }) 
export class NotificationData {
  @Prop({ type: Types.ObjectId, ref: 'user', required: false })
  user?: Types.ObjectId;
}
export const NotificationDataSchema = SchemaFactory.createForClass(NotificationData);

@Schema({
   timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Notification extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  user: Types.ObjectId;

  @Prop({ type: String, required: true })
  event: string;

  @Prop({ type: NotificationDataSchema, required: true })
  data: NotificationData & Record<string, unknown>;

  @Prop({ type: Boolean, default: false })
  is_read: boolean;
}
export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ user: 1, created_at: -1 });
