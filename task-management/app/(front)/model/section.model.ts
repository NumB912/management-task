import { ITaskModel } from "./task.model";
export interface ISectionModel{
    id:string,
    name:string,
    list:string
    tasks:ITaskModel[],
    order:number,
}