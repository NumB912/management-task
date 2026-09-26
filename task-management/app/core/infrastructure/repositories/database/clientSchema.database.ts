
import { Model, Mongoose } from "mongoose";
import {
  FilterSchema,
  ListSchema,
  MemberSchema,
  RuleSchema,
  SectionSchema,
  TagSchema,
  TaskSchema,
  UserSchema
} from "./schema/index.schema"
import { IFilterDocument, IListDocument, IMemberDocument, IRuleDocument, ISectionDocument, ITagDocument, ITaskDocument, IUserDocument } from "./interface";
import { MongodbClient } from "./mongoClient.Database";
import { databaseConfig } from "@/app/core/config";
import { IPromodoDocument } from "./interface/promodo.document";
import { PromodoSchema } from "./schema/promodo.schema";
import { INotificationDocument } from "./interface/notification.document";
import { NotificationSchema } from "./schema/notification.schema";
const globalWithModels = globalThis as typeof globalThis & {
  _dbModels?: DatabaseModels;
};

export class DatabaseModels {
  readonly Task: Model<ITaskDocument>;
  readonly Rule: Model<IRuleDocument>;
  readonly Section: Model<ISectionDocument>;
  readonly List: Model<IListDocument>;
  readonly Filter: Model<IFilterDocument>;
  readonly Tag: Model<ITagDocument>;
  readonly User: Model<IUserDocument>;
  readonly Member: Model<IMemberDocument>;
  readonly Promodo:Model<IPromodoDocument>
  readonly Notification:Model<INotificationDocument>

  private constructor(client: Mongoose) {
    this.Task = this.getOrCreate<ITaskDocument>(client, "task", TaskSchema);
    this.Rule = this.getOrCreate<IRuleDocument>(client, "rule", RuleSchema);
    this.Section = this.getOrCreate<ISectionDocument>(
      client,
      "section",
      SectionSchema,
    );
    this.List = this.getOrCreate<IListDocument>(client, "list", ListSchema);
    this.Filter = this.getOrCreate<IFilterDocument>(client, "filter", FilterSchema);
    this.Tag = this.getOrCreate<ITagDocument>(client, "tag", TagSchema);
    this.User = this.getOrCreate<IUserDocument>(client, "user", UserSchema)
    this.Member = this.getOrCreate<IMemberDocument>(client, "member", MemberSchema)
    this.Promodo = this.getOrCreate<IPromodoDocument>(client, "promodo", PromodoSchema)
    this.Notification = this.getOrCreate<INotificationDocument>(client,"notification",NotificationSchema)
  }

  private getOrCreate<T>(client: Mongoose, name: string, schema: any): Model<T> {
    return (client.models[name] as Model<T>) ?? client.model<T>(name, schema);
  }

  static async getInstance(): Promise<DatabaseModels> {
    if (!globalWithModels._dbModels) {
      const mongo = await MongodbClient.getInstance();
      const client = mongo.getClient();
      globalWithModels._dbModels = new DatabaseModels(client);
      console.log("[DatabaseModels] Đã khởi tạo tất cả models");
    }
    return globalWithModels._dbModels;
  }
}


