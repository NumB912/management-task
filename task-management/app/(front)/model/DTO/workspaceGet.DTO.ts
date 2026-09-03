import { IlistInfo } from "../../states/workspace.state";
import { IFilterModel } from "../filter.model";
import { ITagModel } from "../tag.model";


export interface IWorkspaceGetDTO{
    filters:IFilterModel[],
    inbox:{
        taskCount:number,
    },
    lists:IlistInfo[],
    tags:ITagModel[],
    today:{
        taskCount:number,
    }[]
    next7Days:{
        taskCount:number
    }[]
}