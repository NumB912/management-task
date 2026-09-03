
import { IRule } from "./rule.entities"


export interface ITask {
  id: string
  name: string
  section:string
  rule?:IRule
  description?:string
  list:string,
  children?:ITask[]
  done_at?:Date
  status:"done"|"won't do"|"pending"
  parent?:ITask
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

export interface ITaskPartial extends Omit<Partial<ITask>,"rule"|"children"|"parent">{
  rule:Partial<IRule>,
  parent:Partial<ITaskPartial>
  children:Partial<ITaskPartial>[]
}


