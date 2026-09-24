import { IMemberModel } from "./member.model";
import { ISectionModel } from "./section.model";
import { ITaskModel } from "./task.model";
export interface IListModel{
    id:string,
    name:string,
    order:number,
    tasks?:ITaskModel[],
    shared_tags:string[],
    members:IMemberModel[],
    isShareList?:boolean,
    sections?:ISectionModel[],
    user:string,
}


export interface IListModelState extends Omit<IListModel,"sections">{
    sections:string[]
}