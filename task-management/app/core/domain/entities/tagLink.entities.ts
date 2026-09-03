import { IList } from "./list.entities"
import { ITag } from "./tag.entities"

export interface ITagLink{
    id:string
    tag:ITag,
    list:IList,
    created_at?:Date
    updated_at?:Date
    deleted_at?:Date
}

export interface ITagWithId extends Omit<ITag,"user">{
    user:string
}