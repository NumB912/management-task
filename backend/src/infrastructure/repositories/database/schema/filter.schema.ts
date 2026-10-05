import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from './base.schema.js';

export type IFilterDocument = HydratedDocument<Filter>;

export const FILTER_SPECIALS = ['overdue', 'none', 'today', 'next 7 days'] as const;
export const FILTER_STATUSES = ['done', 'pending', 'none', "won't do"] as const;

@Schema()
export class Filter extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: Date, required: false })
  start_date: Date|null;

  @Prop({ type: Date, required: false })
  end_date: Date|null;

  @Prop({
    type: Number,
    enum: { values: [1, 2, 3, 4], message: 'Priority chỉ được từ 1 đến 4' },
    default: 4,
  })
  priority: number;

  @Prop({
    type: String,
    enum: { values: FILTER_SPECIALS, message: 'Giá trị specials không hợp lệ' },
    default: 'none',
  })
  specials: string;

  @Prop({
    type: String,
    enum: { values: FILTER_STATUSES, message: 'Giá trị status không hợp lệ' },
    default: 'none',
  })
  status: string;

  @Prop({
    type:String,
    required:false
  })
  description:string

}

export const FilterSchema = SchemaFactory.createForClass(Filter);
FilterSchema.index({ deleted_at: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });
