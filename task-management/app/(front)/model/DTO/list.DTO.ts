import { IListModel } from "../list.model";



export interface ICreateListDTO extends Pick<IListModel, "name">{
}

