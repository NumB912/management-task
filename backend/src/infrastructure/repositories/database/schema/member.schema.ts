import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema.js';
import { HydratedDocument, Types } from 'mongoose';
import { IUserWithoutPasswordDocument } from './user.schema.js';

export type IMemberDocument = HydratedDocument<Member>;
export interface IMemberPopulateDocument extends Omit<IMemberDocument,"user">{
  user?:IUserWithoutPasswordDocument
}

@Schema()
export class Member extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'list', required: true })
  list: Types.ObjectId;

  @Prop({
    type: String,
    enum: { values: ['can edit', 'read only', 'owner'], message: "Không có quyền này" },
    default: 'read only',
    required: true,
  })
  role: string;

  @Prop({ type: Date, required: false })
  expire_at?: Date;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({
    type: String,
    enum: { values: ['accept', 'deny', 'expired', 'pending'], message: 'Không có trạng thái này' },
    required: true,
  })
  status: string;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
MemberSchema.index({ expire_at: 1 }, { expireAfterSeconds: 24 * 60 * 60 });
MemberSchema.index({ deleted_at: 1 }, { expireAfterSeconds: 24 * 60 * 60 });
