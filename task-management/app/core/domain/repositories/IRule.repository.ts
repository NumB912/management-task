import { IRuleWithId } from "../entities/rule.entities";
import { IRepository } from "./IRepositories";

export interface IRuleRepository extends IRepository<IRuleWithId> {
    pushTagsIntoRule(ruleId: string, tags:string[], session?: unknown): Promise<void>
    pullTagsOutOfRule(DTO: {
      nameTags: string[];
      ruleIds: string[];
      session?: unknown;
    }):Promise<{ matchedCount: number; modifiedCount: number}>
    getRuleInListAndTags(DTO: { listIds: string[]; nameTags: string[] }):Promise<{
  _id:string,
  rules:IRuleWithId[]
}[]>
    updateRuleTag(DTO:{
      ruleIds:string[],
      currentName: string,
    newName: string,
    session?: unknown
    }):Promise<void>

        deleteByPath(path: string,session?:unknown):Promise<boolean>
}
