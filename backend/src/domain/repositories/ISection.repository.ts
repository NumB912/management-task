import { ISection, ISectionWithId } from "../entities/index.js";
import { IRepository } from "./IRepository.js";


export interface ISectionRepository extends IRepository<ISectionWithId>{
  findSectionByList(listId: string,user_id:string,session?:unknown): Promise<Partial<ISection>[]>;
  pushTaskIntoSection(DTO:{id:string,tasks:string[]},session?:unknown):Promise<void>
  pullTaskFromSection(DTO:{id:string,tasks:string[]},session?:unknown):Promise<void>
  findByTaskId(taskId: string, session?: unknown): Promise<ISectionWithId | null>
    deleteByPath(path: string,session?:unknown):Promise<boolean>
}