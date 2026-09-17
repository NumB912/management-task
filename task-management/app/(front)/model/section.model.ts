import { ITaskModel } from "./task.model";
export interface ISectionModel{
    id:string,
    name:string,
    list:string
    tasks:ITaskModel[],
    order:number,
}

export interface ISectionModelState extends Omit<ISectionModel,"tasks">{
    tasks:string[]
}