import type { IRuleModel } from "../rule/rule.model";

export interface ICreateRuleDTO extends Pick<IRuleModel, "end_date" | "start_date" | "repeat" | "timer" | "tags" | "priority"> {}

export interface ITagOperationsDTO {
  add?: string[];
  delete?: string[];
}

export type IUpdateRuleDTO = Partial<Omit<IRuleModel, "tags">> & {
  tags?: string[] | ITagOperationsDTO;
};
