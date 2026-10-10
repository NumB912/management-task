import { Model, Mongoose } from "mongoose";
import { MongodbClient } from "./mongoClient.Database.js";
import {
  IFilterDocument,
  IListDocument,
  IMemberDocument,
  INotificationDocument,
  IColorDocument,
  pomodoroDocument,
  RuleDocument,
  ISectionDocument,
  TagDocument,
  TaskDocument,
  UserDocument,
} from "./schema/index.schema.js";
import {
  FilterSchema,
  ListSchema,
  MemberSchema,
  NotificationSchema,
  ColorSchema,
  pomodoroSchema,
  RuleSchema,
  SectionSchema,
  TagSchema,
  TaskSchema,
  UserSchema,
} from "./schema/index.schema.js";
import { ITaskDocument } from "./schema/task.schema.js";
import { IRuleDocument } from "./schema/rule.schema.js";
import { ITagDocument } from "./schema/tag.schema.js";
import { IUserDocument } from "./schema/user.schema.js";
import { IpomodoroDocument } from "./schema/pomodoro.schema.js";
import { AppError } from "@/domain/index.js";


export class DatabaseModels {
  private static instance:DatabaseModels
  readonly Task: Model<ITaskDocument>;
  readonly Rule: Model<IRuleDocument>;
  readonly Section: Model<ISectionDocument>;
  readonly List: Model<IListDocument>;
  readonly Filter: Model<IFilterDocument>;
  readonly Tag: Model<ITagDocument>;
  readonly User: Model<IUserDocument>;
  readonly Member: Model<IMemberDocument>;
  readonly pomodoro:Model<IpomodoroDocument>
  readonly Notification:Model<INotificationDocument>
  readonly Color:Model<IColorDocument>

  private constructor(client: Mongoose) {
    this.Task = this.getOrCreate<TaskDocument>(client, "task", TaskSchema);
    this.Rule = this.getOrCreate<RuleDocument>(client, "rule", RuleSchema);
    this.Section = this.getOrCreate<ISectionDocument>(
      client,
      "section",
      SectionSchema,
    );
    this.List = this.getOrCreate<IListDocument>(client, "list", ListSchema);
    this.Filter = this.getOrCreate<IFilterDocument>(client, "filter", FilterSchema);
    this.Tag = this.getOrCreate<TagDocument>(client, "tag", TagSchema);
    this.User = this.getOrCreate<IUserDocument>(client, "user", UserSchema)
    this.Member = this.getOrCreate<IMemberDocument>(client, "member", MemberSchema)
    this.pomodoro = this.getOrCreate<IpomodoroDocument>(client, "pomodoro", pomodoroSchema)
    this.Notification = this.getOrCreate<INotificationDocument>(client,"notification",NotificationSchema)
    this.Color = this.getOrCreate<IColorDocument>(client,"color",ColorSchema)
  }

  private getOrCreate<T>(client: Mongoose, name: string, schema: any): Model<T> {
    return (client.models[name] as Model<T>) ?? client.model<T>(name, schema);
  }

  static async getInstance(client:Mongoose): Promise<DatabaseModels> {
    if(!client){
      throw new AppError("NOT_FOUND","Không tìm thấy client db",404)
    }
    if (!this.instance) {
      this.instance = new DatabaseModels(client);
      console.log("[DatabaseModels] Đã khởi tạo tất cả models");
    }
    return this.instance;
  }
}


