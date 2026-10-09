import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from './base.schema.js';
import { IMemberPopulateDocument } from './member.schema.js';
import { ISectionPopulateDocument } from './section.schema.js';
import { ITaskPopulateDocument } from './task.schema.js';

export type IListDocument = HydratedDocument<List>;

export interface IListPopulateDocument extends Omit<IListDocument,"sections"|"members"|"tasks">{
  sections:ISectionPopulateDocument[],
  members:IMemberPopulateDocument[],
  tasks:ITaskPopulateDocument[]
} 

@Schema()
export class List extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: false, default: '' })
  path: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'section' }], required: false })
  sections: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'member' }], required: false })
  members: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isShareList: boolean;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: [String] })
  shared_tags: string[];

  @Prop({type:[{type:Types.ObjectId,ref:'task'}],require:false})
  tasks:Types.ObjectId[]

  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  user: Types.ObjectId;
}

export const ListSchema = SchemaFactory.createForClass(List);
ListSchema.index({ deleted_at: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });
