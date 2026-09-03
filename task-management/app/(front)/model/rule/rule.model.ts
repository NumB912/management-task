import { ITime, mode } from "../type/type";
export interface IRuleModel {
  id: string;
  task: string;
  list:string,
  start_date?: Date|null; 
  end_date?: Date|null;   
  timer?: ITime|null;
  repeat: IRepeat;
  tags:string[],
  priority?:1|2|3|4,
}


export interface IRepeat {
  mode:mode;
  every?: number;
  dates?: number[];
  days?: number[];
  specificDays?: Date[];
}

