import { IFilterModel } from "../filter.model";
import { IListModel } from "../list.model";



export interface ICreateFitlerDTO extends Pick<IFilterModel, "name"|"priority"|"specials"|"end_date"|"start_date"|"status"|"tags"|"description">{
}

