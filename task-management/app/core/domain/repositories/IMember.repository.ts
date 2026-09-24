
import { IMemberWithId } from "../entities";
import { IRepository } from "./IRepositories";

export interface IMemberRepository extends IRepository<IMemberWithId> {
    checkMembersIsExist(userIds: string[], listId: string,session?:unknown): Promise<string[]>
    searchMember(email: string, listId: string): Promise<void>
    getMembersInLists(listIds: string[], session?: unknown):Promise<{
       id:string,
       members:IMemberWithId[]
     }[]>
}
