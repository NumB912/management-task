import { IStatusMember } from "../entities/member.entity.js";
import { INotification } from "../entities/notification.entity.js";
import { IRepository } from "./IRepository.js";



export interface INotificationRepository extends IRepository<INotification> {
    updateNotificationInviteMemberStatus(DTO:{listId:string,userId:string,status:IStatusMember},session?:unknown):Promise<boolean>
}
