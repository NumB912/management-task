import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema.js';
import { HydratedDocument, Types } from 'mongoose';
import { ITask } from '@/domain/entities/index.js';
import { ITaskDocument, ITaskPopulateDocument } from './task.schema.js';

export type ISectionDocument = HydratedDocument<Section>;
export interface ISectionPopulateDocument extends Omit<ISectionDocument,"tasks">{
    tasks:ITaskPopulateDocument[],
}
@Schema()
export class Section extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'list', required: true })
  list: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'task' }], required: false })
  tasks: Types.ObjectId[];

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: Number, default: 0, required: true })
  order: number;
}

export const SectionSchema = SchemaFactory.createForClass(Section);
SectionSchema.index({ deleted_at: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });
