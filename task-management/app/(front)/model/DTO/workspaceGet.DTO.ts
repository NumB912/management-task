import { IFilterModel } from "../filter.model";
import { IListModel } from "../list.model";
import { ITagModel } from "../tag.model";


export interface IWorkspaceGetDTO{
    filters:IFilterModel[],
    lists:IListModel[],
    tags:ITagModel[],
}