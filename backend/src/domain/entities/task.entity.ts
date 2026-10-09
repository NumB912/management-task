
import { IRule } from "@domain/entities/index.js"

export type IStatusTask  ="done"|"won't do"|"pending"
export interface ITask {
  id: string
  name: string
  section?:string|null
  rule?:IRule
  description?:string
  list:string,
  children?:ITaskWithId[]
  done_at?:Date
  status:IStatusTask,
  parent?:ITaskWithId
  path:string
  order:number
  created_at:Date
  updated_at?:Date
  deleted_at?:Date
}

export interface ITaskWithId extends Omit<ITask,"rule"|"children"|"parent">{
  children?:string[],
  parent?:string,
  rule?:string
}



