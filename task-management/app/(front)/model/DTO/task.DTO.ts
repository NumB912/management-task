
import { IRuleModel } from "../rule/rule.model";
import { ITaskModel } from "../task.model";


export interface ICreateTaskDTO extends Pick<ITaskModel,"list"|"name"|"description">{
      rule:Pick<IRuleModel,"priority"|"repeat"|"start_date"|"end_date"|"tags"|"timer">
}

export interface ICreateTaskWithSectionDTO extends Pick<ITaskModel,"list"|"section"|"name"|"description">{
      rule:Pick<IRuleModel,"priority"|"repeat"|"start_date"|"end_date"|"tags"|"timer">
}

export interface IUpdateTaskDTO extends Omit<ITaskModel,"id"|"rule">{
      rule:Pick<IRuleModel,"priority"|"repeat"|"start_date"|"end_date"|"tags"|"timer">
}

