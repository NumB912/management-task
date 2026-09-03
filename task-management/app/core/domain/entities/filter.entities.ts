export type ISpecials = "overdue"|"today"|"next 7 days"|"none"
export  type IStatus = "done"|"pending"|"none"|"won't do"
export  type Ipriority = 1|2|3|4
export interface IFilter{
    id:string
    name:string
    user:string,
    tags:string[],
    description?:string
    priority?:Ipriority,
    start_date?:Date,
    end_date?:Date,
    specials:ISpecials,
    status:IStatus
    created_at:Date
    updated_at?:Date
    deleted_at?:Date
}

export interface IFilterWithId extends IFilter{

}