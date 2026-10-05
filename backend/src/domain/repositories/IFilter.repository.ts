import { IFilterWithId } from "../entities/filter.entity.js";
import { IRepository } from "./IRepository.js";

export interface IFilterRepository extends IRepository<IFilterWithId>{
    changeNameTag(DTO: {
      userId: string;
      currentName: string;
      newName: string;
      session?: unknown;
    }):Promise<number>
}
