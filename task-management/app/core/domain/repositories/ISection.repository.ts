import { ISection, ISectionWithId } from "../entities";
import { IRepository } from "./IRepositories";

export interface ISectionRepository extends IRepository<ISectionWithId>{
  findSectionByList(listId: string,user_id:string): Promise<Partial<ISection>[]>;
  pushTaskIntoSection(DTO:{id:string,tasks:string[],session?:unknown}):Promise<void>
  pullTaskFromSection(DTO:{id:string,tasks:string[],session?:unknown}):Promise<void>
  findByTaskId(taskId: string, session?: unknown): Promise<ISectionWithId | null>
    deleteByPath(path: string,session?:unknown):Promise<boolean>
}