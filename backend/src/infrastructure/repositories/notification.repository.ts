

import { Inject, Injectable } from "@nestjs/common";
import { ClientSession } from "mongoose";
import { BaseRepository } from "./base.repository.js";
import { INotificationRepository } from "@/domain/repositories/INotification.repository.js";
import { INotification } from "@/domain/entities/notification.entity.js";
import { INotificationDocument } from "./database/schema/notification.schema.js";
import { NotificationMapper } from "../mapper/notification.mapper.js";
import { DatabaseModels } from "./database/clientSchema.database.js";
import { TYPES } from "../types/dependency.type.js";
import { IStatusMember } from "@/domain/entities/member.entity.js";
@Injectable()
export class NotificationRepository
  extends BaseRepository<INotificationDocument, INotification>
  implements INotificationRepository {
  protected toDomain(doc: INotificationDocument): INotification {
    return this.NotificationMapper.toDomain(doc)
  }
  protected toDomainPartial(doc: Partial<INotificationDocument>): Partial<INotification> {
    return this.NotificationMapper.toDomainPartial(doc)
  }
  protected toPresistence(doc: Partial<INotification>): Partial<INotificationDocument> {
    return this.NotificationMapper.toPersistencePartial(doc)
  }
  protected toPresistencePartial(doc: Partial<INotification>): Partial<INotificationDocument> {
    return this.NotificationMapper.toPersistencePartial(doc)
  }
  constructor(
    @Inject(TYPES.DatabaseType)
    private readonly db: DatabaseModels,
    @Inject(TYPES.NotificationMapper)
    private readonly NotificationMapper: NotificationMapper
  ) {
    super(db.Notification);
  }

  async updateNotificationInviteMemberStatus(DTO:{listId:string,userId:string,status:IStatusMember},session?:ClientSession):Promise<boolean>{
    const {listId,status,userId} = DTO
    const update = await this.db.Notification.updateOne({
      event:"invite-member",
      "data.listId":listId,
      user:userId,
    },{
      "data.status":status
    },session??null)

    return update.modifiedCount > 0
  }
}
