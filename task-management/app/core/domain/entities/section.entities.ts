import { ITask } from "./task.entites"

export interface ISection{
    id:string
    name:string
    list:string,
    tasks?:ITask[]
    path:string,
    order:number
    created_at:Date
    updated_at?:Date
    deleted_at?:Date
}

export interface ISectionWithId extends Omit<ISection,"tasks">{
    tasks:string[]
}