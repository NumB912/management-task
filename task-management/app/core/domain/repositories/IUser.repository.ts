import { IUser, IUserWithouPassword } from "../entities";
import { IRepository } from "./IRepositories";

export interface IUserRepository extends IRepository<IUser,string>{
    searchByEmail(email:string): Promise<Partial<IUserWithouPassword>[]> 
    searchByEmailWithout(email:string,ids:string[]): Promise<Partial<IUserWithouPassword>[]> 
    searchByManyEmail(email:string[],session?:unknown):Promise<IUserWithouPassword[]>
} 