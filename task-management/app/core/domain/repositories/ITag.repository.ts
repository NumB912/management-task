import { ITagWithId, ITask } from "../entities";
import { IRepository } from "./IRepositories";

export interface ITagRepository extends IRepository<ITagWithId, string> {
  findTagByName(DTO: { name: string, userId: string, session?: unknown; }): Promise<ITagWithId | null>
  findTagsByName(DTO: { nameTags: string[], userId: string, session?: unknown; }): Promise<ITagWithId[]>
  updateByName(DTO: { name: string, userId: string; data: Partial<ITagWithId>; session?: unknown; }): Promise<ITagWithId | null>
  updateManyUserIdsAndName(DTO: {
    userIds: string[],
    curName: string,
    newName: string,
    session?: unknown
  }): Promise<void>
  findTagsByUsers(DTO:{
    userIds:string[],
    session?:unknown
  }):Promise<{
    userId:string,
    tags:ITagWithId[]
  }[]>
  deleteByName(DTO: { name: string, userId: string, session?: unknown }): Promise<boolean>
  isUserHaveTag(DTO:{
    userId:string,
    tagNames:string[],
    session?:unknown
  }):Promise<ITagWithId[]>
}