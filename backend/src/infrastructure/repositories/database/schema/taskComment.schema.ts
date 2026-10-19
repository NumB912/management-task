import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

@Schema({ collection: 'task_comments' })
export class TaskCommentRecord {
  @Prop({ type: Types.ObjectId, ref: 'task', required: true })
  task: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  author: Types.ObjectId;
  @Prop({ type: String, required: true })
  authorName: string;
  @Prop({ type: String, default: null })
  authorAvatar: string | null;
  @Prop({ type: Types.ObjectId, ref: 'task_comment', default: null })
  parent: Types.ObjectId | null;
  @Prop({ type: Types.ObjectId, ref: 'task_comment', default: null })
  replyTo: Types.ObjectId | null;
  @Prop({ type: String, default: null })
  replyToName: string | null;
  @Prop({ type: String, required: true, maxlength: 2000 })
  body: string;
  @Prop({ type: String, required: true })
  clientRequestId: string;
  @Prop({ type: Date, default: () => new Date() })
  createdAt: Date;
}
export type TaskCommentDocument = HydratedDocument<TaskCommentRecord>;
export const TaskCommentSchema =
  SchemaFactory.createForClass(TaskCommentRecord);
TaskCommentSchema.index({ task: 1, _id: -1 });
TaskCommentSchema.index({ task: 1, parent: 1, _id: -1 });
TaskCommentSchema.index(
  { task: 1, author: 1, clientRequestId: 1 },
  { unique: true },
);
