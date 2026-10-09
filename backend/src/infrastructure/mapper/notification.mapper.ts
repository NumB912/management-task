import { Types } from "mongoose";

import { IMapper } from "@/domain/mapper/Imapper.mapper.js";
import { INotification } from "@/domain/entities/notification.entity.js";
import { INotificationDocument } from "../repositories/database/schema/notification.schema.js";
import { Injectable } from "@nestjs/common";
@Injectable()
export class NotificationMapper implements IMapper<INotificationDocument, INotification> {
  toDomainPopulate(doc: INotificationDocument): INotification {
    return {
      created_at:doc.created_at,
      data:doc.data,
      event:doc.event,
      id:doc._id.toString(),
      is_read:doc.is_read,
      user:doc.user.toString()
    }
  }
  toDomainPopulateList(docs: INotificationDocument[]): INotification[] {
    return docs.map((doc)=>this.toDomainPopulate(doc))
  }
  toDomain(doc: INotificationDocument): INotification {
    return {
      id: doc._id.toString(),
      user: doc.user.toString(),
      data: doc.data,
      event: doc.event,
      is_read: doc.is_read,
      created_at: doc.created_at,
    };
  }

  toDomainPartial(doc: Partial<INotificationDocument>): Partial<INotification> {
    const partial: Partial<INotification> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.user) partial.user = doc.user.toString();
    if (doc.data) partial.data = doc.data;
    if (doc.event) partial.event = doc.event;
    if (doc.is_read !== undefined) partial.is_read = doc.is_read;
    if (doc.created_at) partial.created_at = doc.created_at;
    return partial;
  }

  toDomainList(docs: INotificationDocument[]): INotification[] {
    return docs.map((doc) => this.toDomain(doc));
  }

  toPersistence(notification:INotification): Partial<INotificationDocument> {
    return {
      _id:new Types.ObjectId(notification.id),
      user: new Types.ObjectId(notification.user),
      event: notification.event,
      data: notification.data,
      is_read: notification.is_read ?? false,
    };
  }

  toPersistencePartial(notification: Partial<INotification>): Partial<INotificationDocument> {
    const update: Partial<INotificationDocument> = {};
    if (notification.id) update._id = new Types.ObjectId(notification.id);
    if (notification.user) update.user = new Types.ObjectId(notification.user);
    if (notification.event) update.event = notification.event;
    if (notification.data) update.data = notification.data;
    if (notification.is_read !== undefined) update.is_read = notification.is_read;
    return update;
  }
}