import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema.js';
import { HydratedDocument } from 'mongoose';

export type IUserDocument = HydratedDocument<User>;
export type UserDocument = IUserDocument;
export interface IUserWithoutPasswordDocument extends Omit<IUserDocument,"password">{}
@Schema()
export class User extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: false })
  avatar?: string|null;

  @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
