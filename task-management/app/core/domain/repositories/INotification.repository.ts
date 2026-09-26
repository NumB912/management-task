
import { IStatusMember } from "@/app/(front)/model/member.model";
import { IMemberWithId, INotification } from "../entities";
import { IRepository } from "./IRepositories";

export interface INotificationRepository extends IRepository<INotification> {
    updateNotificationInviteMemberStatus(DTO:{listId:string,userId:string,status:IStatusMember},session?:unknown):Promise<boolean>
}
