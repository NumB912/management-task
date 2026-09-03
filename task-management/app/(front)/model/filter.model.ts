import { Ipriority, ISpecials, IStatus } from "./type/type"

export interface IFilterModel{
  id:string
    name:string,
    user:string,
    tags:string[],
    description?:string
    priority?:Ipriority,
    start_date?:Date|null,
    end_date?:Date|null,
    specials:ISpecials,
    status:IStatus,
}