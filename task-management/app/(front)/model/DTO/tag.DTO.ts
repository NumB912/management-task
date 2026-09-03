
import { ITagModel } from "../tag.model";
export interface ICreateTagDTO extends Pick<ITagModel,"name">{

}


export interface IUpdateTagDTO extends Omit<ITagModel,"id">{

}

