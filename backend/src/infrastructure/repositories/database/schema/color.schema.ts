import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema.js';
import { HydratedDocument, Types } from 'mongoose';

export type IColorDocument = HydratedDocument<Color>;

@Schema()
export class Color extends BaseSchema {
  @Prop({ type: String, required: true })
  color: string;
  @Prop({ type: String, required: true })
  path: string;
  @Prop({
    type: String,
    required: true,
    enum: {
      values: ['list', 'task'],
      message: 'Loại color chỉ được là list hoặc task',
    },
  })
  type: string;
  @Prop({ type: Types.ObjectId, required: true, ref:"type" })
  refId: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  user: Types.ObjectId;
}

export const ColorSchema = SchemaFactory.createForClass(Color);
ColorSchema.index({ deleted_at: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });
ColorSchema.index({ type: 1, refId: 1, user: 1 }, { unique: true });
