import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema.js';
import { HydratedDocument, Types } from 'mongoose';

export type PromodoDocument = HydratedDocument<Promodo>;
export type IPromodoDocument = PromodoDocument;
export interface IPromodoDocumentPopulate extends Omit<IPromodoDocument, "task"> {
  task?: { _id: Types.ObjectId; name: string };
}

@Schema({ _id: false })
export class PromodoProgress {
  @Prop({ type: Date, required: true, default: () => new Date() })
  startPause: Date;

  @Prop({ type: Number, required: true, default: 0 })
  duration: number;
}

export const PromodoProgressSchema = SchemaFactory.createForClass(PromodoProgress);

@Schema()
export class Promodo extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Types.ObjectId, required: false, ref: 'task' })
  task?: Types.ObjectId;

  @Prop({ type: Date, required: true })
  start: Date;

  @Prop({ type: Number, required: true })
  duration: number;

  @Prop({ type: [PromodoProgressSchema] })
  progress: PromodoProgress[];

  @Prop({ type: Types.ObjectId, required: true, ref: 'user' })
  user: Types.ObjectId;
}

export const PromodoSchema = SchemaFactory.createForClass(Promodo);
