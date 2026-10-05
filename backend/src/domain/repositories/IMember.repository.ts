import { IRepository } from "@domain/repositories/index.js"
import { IMemberWithId } from "@domain/entities/index.js"



export interface IMemberRepository extends IRepository<IMemberWithId> {
    checkMembersIsExist(email: string[], listId: string,session?:unknown): Promise<string[]>
    searchMember(email: string, listId: string): Promise<void>
    getMembersInLists(listIds: string[], session?: unknown):Promise<{
       id:string,
       members:IMemberWithId[]
     }[]>
}
