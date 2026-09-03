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
 