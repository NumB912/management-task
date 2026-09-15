
import { IPromodo, IPromodoWithId } from "../entities/promodo.entities";
import { IRepository } from "./IRepositories";
export interface IPromodoRepository extends IRepository<IPromodoWithId>{
    getPromodoDetail(userId:string):Promise<Partial<IPromodo>[]>
}
