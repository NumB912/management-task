import { ITask } from "./task.entity.js"

export interface IPromodo{
    id:string
    name:string
    task?:Pick<ITask,"id"|"name">
    start:Date
    duration:number,
    progress:{
        startPause:Date,
        duration:number
    }[]
    user:string,
    created_at:Date
    updated_at?:Date
    deleted_at?:Date
}

export interface IPromodoWithId extends Omit<IPromodo,"task">{
    task?:string
}