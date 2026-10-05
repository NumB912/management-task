import { IUserWithouPassword } from "./user.entity.js"

export interface ITag{
    id:string
    name:string
    user:IUserWithouPassword
    isShareTag?:boolean,
    created_at:Date
    updated_at?:Date
    deleted_at?:Date
}

export interface ITagWithId extends Omit<ITag,"user">{
    user?:string
}