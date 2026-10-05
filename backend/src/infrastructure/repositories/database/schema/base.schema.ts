import { Prop } from '@nestjs/mongoose';
export abstract class BaseSchema {
  @Prop({ type: Date, default: () => new Date() })
  created_at: Date;
  @Prop({ type: Date, default: null,required:false })
  updated_at:  Date|null;
  @Prop({ type: Date, default: null,required:false })
  deleted_at: Date|null;
}