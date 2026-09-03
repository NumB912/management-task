
import { IRuleModel } from "../rule/rule.model";
import { ITaskModel } from "../task.model";


export interface ICreateRuleDTO extends Pick<IRuleModel, "end_date" | "start_date" | "repeat" | "timer"|"tags"|"priority">{
}

export interface IUpdateRuleDTO extends Pick<IRuleModel, "end_date" | "start_date" | "repeat" | "timer" | "priority" | "tags" |"list">{

}
