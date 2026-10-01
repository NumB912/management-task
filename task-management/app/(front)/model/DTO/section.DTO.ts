
import { ISectionModel } from "../section.model";



export interface ICreateSectionDTO extends Pick<ISectionModel,"name"|"id">{

}


export interface IUpdateSectionDTO extends Omit<ISectionModel,"id">{

}

