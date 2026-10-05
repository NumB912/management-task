import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema.js';
import { HydratedDocument, Types } from 'mongoose';
import { IUserWithoutPasswordDocument } from './user.schema.js';

export type ITagDocument = HydratedDocument<Tag>;
export type TagDocument = ITagDocument;
export interface ITagPopulateDocument extends Omit<ITagDocument,"user">{
  user:IUserWithoutPasswordDocument
}
@Schema()
export class Tag extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: Number, default: 0 })
  order: number;
  @Prop({ type: Types.ObjectId, ref: 'user', required: false })
  user?: Types.ObjectId;
  @Prop({ type: Boolean, required: false, default: false })
  isShareTag?: boolean;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
TagSchema.index({ deleted_at: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });
