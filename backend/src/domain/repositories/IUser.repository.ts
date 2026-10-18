import { IUser, IUserWithouPassword } from "../entities/user.entity.js"
import { IRepository } from "./IRepository.js"

export interface IUserRepository extends IRepository<IUser,string>{
    linkGoogle(id: string, googleId: string): Promise<boolean>
    findByEmailCaseInsensitive(email:string): Promise<IUser | null>
    searchByEmail(email:string): Promise<Partial<IUserWithouPassword>[]> 
    searchByEmailWithout(email:string,ids:string[]): Promise<Partial<IUserWithouPassword>[]> 
    searchByManyEmail(email:string[],session?:unknown):Promise<IUserWithouPassword[]>
}
