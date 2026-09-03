
import { DashboardListsResult } from "../../DTO/list/list.DTO";
import { IList, IListWithId } from "../entities/list.entities";
import { IRepository } from "./IRepositories";


export interface IListRepository extends IRepository<IListWithId, string> {
  findByIdPopulate(id: string): Promise<Partial<IList> | null>
  findListByUser(user: string): Promise<Partial<IList>[]>
  pushSectionsIntoList(DTO: { sectionIds: string[], listId: string, session?: unknown }): Promise<void>
  pullSectionsOutOfList(DTO: { sectionIds: string[], listId: string, session?: unknown }): Promise<void>
  pushMembersIntoList(DTO: {
    memberIds: string[],
    listId: string,
    session?: unknown
  }): Promise<void>
  pullMembersOutOfList(DTO: { memberIds: string[], listId: string, session?: unknown }): Promise<void>
  pushTagsIntoList(DTO: {
    share_tags: { tag: string, created_by: string }[],
    listId: string,
    session?: unknown
  }): Promise<void>
  pullTagsOutOfList(DTO: { nameTags: string[], listIds: string[], session?: unknown }): Promise<void>
  getMemberInList(listId: string, session?: unknown): Promise<{ _id: string, members: { memberId: string, userId: string }[] } | null>
  getListAll(userId: string, session?: unknown): Promise<DashboardListsResult>
  getListByUser(DTO: { userId: string }): Promise<IListWithId[]>
  getListByTagNameAndUserId(DTO: {
    tagName: string[], userId: string,
  }): Promise<IListWithId[]>
  updateListShareTag(DTO: {
    currentName: string,
    newName: string,
    listIds: string[],
    session?: unknown
  }): Promise<void>

   getShareTagFromList(DTO:{
      listIds:string[],
      session?:unknown
    }):Promise<{
      listId:string,
      tags:string[]
    }[]>

  getMemberAndTagFromList(DTO: {
      listIds: string[],
      session?: unknown
    }): Promise<{
      listId: string,
      tags: string[]
      members:{
        id:string,
        userId:string,
      }[]
    }[]>
  getCurrentTag(DTO:{
    listId:string,
    session?:unknown
  }):Promise<{
    tags:string[]
  }>
  getInbox(DTO:{
    userId:string
  }):Promise<IList|null>

  getListAndSection(DTO: {
      userId: string,
      session?: unknown
    }): Promise<{ lists: Pick<IList, "name" | "id" | "sections">[] }>
      deleteByPath(path: string,session?:unknown):Promise<boolean>
}

