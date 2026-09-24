
import { IFilterWithId } from "../entities";
import { IRepository } from "./IRepositories";
export interface IFilterRepository extends IRepository<IFilterWithId>{
    changeNameTag(DTO: {
      userId: string;
      currentName: string;
      newName: string;
      session?: unknown;
    }):Promise<number>
}
