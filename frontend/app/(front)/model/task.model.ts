import { IColorModel } from "./color.model";
import {IRuleModel } from "./rule/rule.model";

export interface ITaskModel {
  id: string
  name: string
  section?:string
  rule:IRuleModel
  description?:string
  list:string
  children:ITaskModel[]
  done_at?:Date
  color:string
  status:"done"|"won't do"|"pending"
  parent?:ITaskModel
  colorAssignment?:IColorModel
}

export interface ICreateTaskModel extends Omit<ITaskModel,"rule"|"children"|"parent"|"id"|"status"|"order">{
  rule:Omit<IRuleModel,"id"|"task">
} 
