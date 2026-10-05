import { IPriority, ISpecials, IStatus } from "../entities/filter.entity.js"
import { ITask, ITaskWithId } from "../entities/task.entity.js"
import { IRepository } from "./IRepository.js"


export interface ITaskRepository extends IRepository<ITaskWithId, string> {
  findByIdPopulate(id: string,session?:unknown): Promise<ITask | null>
  findTasksByTagForUser(DTO: {
    tagName: string,
    userId: string,
    session?: unknown
  }): Promise<Partial<ITask>[]>
  findTasksByFilter(DTO: {
    filter: {
      tagNames?: string[],
      priority?: IPriority,
      specials?: ISpecials,
      status?: IStatus,
      startDate?: Date|null,
      endDate?: Date|null
    },
    userId: string,
    session?: unknown
  }): Promise<Partial<ITask>[]>
  deleteByPath(path: string, session?: unknown): Promise<boolean>

  getToday(
    userId: string,
    session?: unknown,
  ): Promise<Partial<ITask>[]>

  getOverdue(
    userId: string,
    session?: unknown,
  ): Promise<Partial<ITask>[]>

  upComming(
    userId: string,
    session?: unknown,
  ): Promise<Partial<ITask>[]> 
}