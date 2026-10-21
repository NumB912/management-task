import type { ITagOperationsDTO } from "../model/DTO/rule.DTO";
import type { IUpdateRuleDTO } from "../model/DTO/rule.DTO";
import type { IRuleModel } from "../model/rule/rule.model";

export function prepareTaskRuleUpdate(current: IRuleModel, input: IUpdateRuleDTO) {
  const { tags, ...rest } = input;
  const operations = Array.isArray(tags) ? buildTagOperations(current.tags ?? [], tags) : tags;
  return {
    data: { ...rest, ...(operations !== undefined ? { tags: operations } : {}) },
    rule: { ...current, ...rest, ...(operations !== undefined ? {
      tags: applyTagOperations(current.tags ?? [], operations),
    } : {}) },
  };
}

const key = (name: string) => name.toLocaleLowerCase();

export function buildTagOperations(current: string[], selected: string[]): ITagOperationsDTO {
  const before = new Map(current.map((name) => [key(name), name]));
  const after = new Map(selected.map((name) => [key(name), name]));
  const add = [...after].filter(([name]) => !before.has(name)).map(([, name]) => name);
  const remove = [...before].filter(([name]) => !after.has(name)).map(([, name]) => name);
  return { ...(add.length ? { add } : {}), ...(remove.length ? { delete: remove } : {}) };
}

export function applyTagOperations(current: string[], input: string[] | ITagOperationsDTO): string[] {
  if (Array.isArray(input)) return [...new Map(input.map((name) => [key(name), name])).values()];
  const removed = new Set((input.delete ?? []).map(key));
  const result = new Map<string, string>();
  for (const name of current) {
    if (removed.has(key(name))) continue;
    result.set(key(name), name);
  }
  for (const name of input.add ?? []) result.set(key(name), name);
  return [...result.values()];
}
