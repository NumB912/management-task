import { ISectionModel } from "./section.model";
import { ITaskModel } from "./task.model";
export interface IListModel{
    id:string,
    name:string,
    order:number,
    tasks?:ITaskModel[],
    shared_tags:string[],
    isShareList?:boolean,
    sections?:ISectionModel[],
    user:string,
    members:string[]
}