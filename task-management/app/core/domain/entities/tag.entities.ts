import { IRule, IRuleWithId } from "./rule.entities"
import { IUserWithouPassword } from "./user.entites"

export interface ITag{
    id:string
    name:string
    user?:IUserWithouPassword
    list?:string,
    isShareTag?:boolean,
    created_at:Date
    updated_at?:Date
    deleted_at?:Date
}

export interface ITagWithId extends Omit<ITag,"user">{
    user?:string
}