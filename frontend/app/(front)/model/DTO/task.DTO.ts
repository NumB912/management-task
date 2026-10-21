
import { IRuleModel } from "../rule/rule.model";
import { ITaskModel } from "../task.model";
import { IUpdateRuleDTO } from "./rule.DTO";


export interface ICreateTaskDTO extends Pick<ITaskModel,"list"|"name"|"description"|"id">{
      rule:IRuleModel
}

export interface ICreateTaskWithSectionDTO extends Pick<ITaskModel,"id"|"list"|"section"|"name"|"description">{
      rule:IRuleModel
}

export interface IUpdateTaskDTO extends Omit<ITaskModel,"id"|"rule">{
      rule:IUpdateRuleDTO
}

