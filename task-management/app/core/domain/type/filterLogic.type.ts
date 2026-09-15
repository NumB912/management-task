export type FilterType = "special" | "tag" | "name";
export const SPECIAL_KEYWORDS = ["today", "overdue", "pending", "complete"] as const;
export type SpecialKeyword = (typeof SPECIAL_KEYWORDS)[number];
export interface IFilterCondition {
    type: FilterType;
    body: string[];
    negative: boolean;
}
export type FilterAndGroup = IFilterCondition[];
export type FilterOrGroups = FilterAndGroup[];
export interface IQueryFilterParser {
    parse(query: string): FilterOrGroups;
}

export const DEFAULT_RULE_COLORS = [
  "#F87171",
  "#FB923C", 
  "#FBBF24", 
  "#A3E635", 
  "#34D399", 
  "#22D3EE", 
  "#60A5FA", 
  "#A78BFA", 
  "#F472B6", 
  "#94A3B8", 
];

export function pickRandomColor(): string {
  return DEFAULT_RULE_COLORS[Math.floor(Math.random() * DEFAULT_RULE_COLORS.length)];
}