

import { inject, injectable } from "tsyringe";
import { TYPES } from "../container/type.container";
import { BaseRepository } from "./base.repositories";
import { DatabaseModels } from "./database/clientSchema.database";
import { INotificationRepository } from "../../domain/repositories/INotification.repository";
import { INotification } from "../../domain";
import { INotificationDocument } from "./database/interface/notification.document";
import { NotificationMapper } from "./mapper/notification.mapper";
import { IStatusMember } from "@/app/(front)/model/member.model";
import { ClientSession } from "mongoose";
@injectable()
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
    @inject(TYPES.DatabaseType)
    private readonly db: DatabaseModels,
    @inject(TYPES.NotificationMapper)
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
