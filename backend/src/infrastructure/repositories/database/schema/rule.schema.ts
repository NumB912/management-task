import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema.js';
import { HydratedDocument, Types } from 'mongoose';

export type IRuleDocument = HydratedDocument<Rule>;
export type RuleDocument = IRuleDocument;
export type IRulePopulateDocument = IRuleDocument;

@Schema()
export class RuleRepeat {
  @Prop({
    type: String,
    enum: { values: ['week', 'day', 'none', 'month', 'specificday'], message: 'Không tồn tại giá trị này' },
    default: 'none',
  })
  mode: string;

  @Prop({ type: Date, required: false })
  until?: Date;

  @Prop({ type: Number, default: 0 })
  every?: number;

  @Prop({
    type: [Number],
    required: false,
    validate: {
      validator: (dates: number[]) => dates.every((date) => date > 0 && date <= 31),
      message: 'Days phải thuộc từ ngày 1-31',
    },
  })
  dates?: number[];

  @Prop({
    type: [Number],
    required: false,
    validate: {
      validator: (dates: number[]) => dates.every((date) => date >= 0 && date <= 7),
      message: 'Date phải thuộc từ ngày 0-7',
    },
  })
  days?: number[];

  @Prop({ type: [Date], required: false })
  specificDays?: Date[];
}

export const RuleRepeatSchema = SchemaFactory.createForClass(RuleRepeat);

@Schema()
export class Rule extends BaseSchema {
  @Prop({ type: Date, required: false })
  start_date?: Date;

  @Prop({ type: Date, required: false })
  end_date?: Date;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({
    type: Number,
    enum: { values: [1, 2, 3, 4], message: 'Loại không được lấy dữ liệu vượt quá từ 1-4' },
    default: 4,
  })
  priority: number;

  @Prop({ type: Types.ObjectId, required: true, ref: 'list' })
  list: Types.ObjectId;

  @Prop({ type: RuleRepeatSchema, default: { mode: 'none' }, required: false })
  repeat?: RuleRepeat;

  @Prop({ type: [{ type: String, required: true }] })
  tags: string[];

  @Prop({
    type: Number,
    min: [0, 'endTimer phải từ 0 đến 86400'],
    max: [86400, 'endTimer phải từ 0 đến 86400'],
    required: false,
  })
  timer?: number;

  @Prop({
    type: Number,
    required: false,
    min: [0, 'endTimer phải từ 0 đến 86400'],
    max: [86400, 'endTimer phải từ 0 đến 86400'],
  })
  endTimer?: number;

  @Prop({ type: String, required: true })
  color: string;

  @Prop({ type: Types.ObjectId, required: false, ref: 'task' })
  task?: Types.ObjectId;
}

export const RuleSchema = SchemaFactory.createForClass(Rule);
RuleSchema.index({ deleted_at: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });
