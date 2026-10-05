import { ITask } from "../../domain";
import { ICreateRuleDTO } from "../rule/rule.DTO";


export interface ICreateTaskDTO extends Pick<Omit<ITask,"rule">,"name"|"section"|"id">{
    rule:ICreateRuleDTO
}