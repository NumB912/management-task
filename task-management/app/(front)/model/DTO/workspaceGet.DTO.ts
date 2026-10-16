import { IColorModel } from "../color.model";
import { IFilterModel } from "../filter.model";
import { IListModel } from "../list.model";
import { INotificationModel } from "../notification.model";
import { ITagModel } from "../tag.model";


export interface IWorkspaceGetDTO{
    filters:IFilterModel[],
    lists:IListModel[],
    tags:ITagModel[],
    notifications:INotificationModel[]
    colors:IColorModel[]
}