import { FilterAndGroup, FilterOrGroups, IFilterCondition, IQueryFilterParser } from "../type/filterLogic.type";
export interface IQueryFilterParserService extends IQueryFilterParser {
    parse(query: string): FilterOrGroups
    parseAndGroup(group: string): FilterAndGroup
    parseToken(rawToken: string): IFilterCondition
    isSpecialKeyword(token: string): boolean
    isNegated(query: string): boolean
}