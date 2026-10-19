
import { ITagModel } from "../tag.model";
export interface ICreateTagDTO extends Pick<ITagModel,"name">{
  id?: string;
  color?: string;

}


export interface IUpdateTagDTO extends Omit<ITagModel,"id">{

}

