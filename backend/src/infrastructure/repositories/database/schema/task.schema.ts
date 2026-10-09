import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema.js';
import { HydratedDocument, Types } from 'mongoose';
import { IRuleDocument } from './rule.schema.js';

export type ITaskDocument = HydratedDocument<Task>;
export type TaskDocument = ITaskDocument;
export interface ITaskPopulateDocument extends Omit<ITaskDocument,"rule"|"parent"|"children">{
  rule:IRuleDocument,
  parent:ITaskDocument|null,
  children:ITaskDocument[]
}


@Schema()
export class Task extends BaseSchema {
  @Prop({ type: String })
  name: string;

  @Prop({ type: Types.ObjectId, required: false, ref: 'section' })
  section?: Types.ObjectId|null;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'task' }], required: false })
  children: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, required: true, ref: 'list' })
  list: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'rule' })
  rule: Types.ObjectId;

  @Prop({ type: Date, required: false })
  done_at?: Date;

  @Prop({ type: String, enum: ["won't do", 'done', 'pending'], default: 'pending' })
  status: string;

  @Prop({ type: String, required: false })
  path: string;

  @Prop({ type: Types.ObjectId, required: false, ref: 'task' })
  parent?: Types.ObjectId|null;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: String, required: false })
  description?: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ deleted_at: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });
