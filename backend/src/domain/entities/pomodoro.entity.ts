import { ITask } from "./task.entity.js"

export interface Ipomodoro{
    id:string
    name:string
    task?:Pick<ITask,"id"|"name">
    start:Date
    totalDuration:number,
    progress:{
        startPause:Date,
        duration:number
    }[]
    user:string,
    created_at:Date
    updated_at?:Date
    deleted_at?:Date
}

export interface IPomodoroWithId extends Omit<Ipomodoro,"task">{
    task?:string
}