import { IPromodo, IPromodoWithId } from "../entities/promodo.entity.js";
import { IRepository } from "./IRepository.js";


export interface IPromodoRepository extends IRepository<IPromodoWithId>{
    getPromodoDetail(userId:string):Promise<Partial<IPromodo>[]>
}
