import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema.js';
import { HydratedDocument, Types } from 'mongoose';

export type pomodoroDocument = HydratedDocument<pomodoro>;
export type IpomodoroDocument = pomodoroDocument;
export interface IpomodoroDocumentPopulate extends Omit<IpomodoroDocument, "task"> {
  task?: { _id: Types.ObjectId; name: string };
}

@Schema({ _id: false })
export class pomodoroProgress {
  @Prop({ type: Date, required: true, default: () => new Date() })
  startPause: Date;

  @Prop({ type: Number, required: true, default: 0 })
  duration: number;
}

export const pomodoroProgressSchema = SchemaFactory.createForClass(pomodoroProgress);

@Schema()
export class pomodoro extends BaseSchema {
  @Prop({ type: String, required: false })
  name: string;

  @Prop({ type: Types.ObjectId, required: false, ref: 'task' })
  task?: Types.ObjectId;

  @Prop({ type: Date, required: true })
  start: Date;

  @Prop({ type: Number, required: true })
  totalDuration: number;

  @Prop({ type: [pomodoroProgressSchema] })
  progress: pomodoroProgress[];

  @Prop({ type: Types.ObjectId, required: true, ref: 'user' })
  user: Types.ObjectId;
}

export const pomodoroSchema = SchemaFactory.createForClass(pomodoro);
