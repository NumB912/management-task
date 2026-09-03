
import { Ipriority, ISpecials, IStatus } from "../entities";
import { ITask, ITaskPartial, ITaskWithId } from "../entities/task.entites";
import { IRepository } from "./IRepositories";
export interface ITaskRepository extends IRepository<ITaskWithId, string> {
  findByIdPopulate(id: string): Promise<ITask | null>
  findTasksByTagForUser(DTO: {
    tagName: string,
    userId: string,
    session?: unknown
  }): Promise<Partial<ITaskPartial>[]>
  findTasksByFilter(DTO: {
    filter: {
      tagNames?: string[],
      priority?: Ipriority,
      specials?: ISpecials,
      status?: IStatus,
      startDate?: Date,
      endDate?: Date
    },
    userId: string,
    session?: unknown
  }): Promise<Partial<ITaskPartial>[]>
  deleteByPath(path: string, session?: unknown): Promise<boolean>

  getToday(
    userId: string,
    session?: unknown,
  ): Promise<Partial<ITaskPartial>[]>

  getOverdue(
    userId: string,
    session?: unknown,
  ): Promise<Partial<ITaskPartial>[]>

  upComming(
    userId: string,
    session?: unknown,
  ): Promise<Partial<ITaskPartial>[]> 
}