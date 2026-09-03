import { injectable } from "tsyringe";
import { IQueryFilterParserService } from "../../domain";
import { FilterAndGroup, FilterOrGroups, IFilterCondition, SPECIAL_KEYWORDS } from "../../domain/type/filterLogic.type";
@injectable()
export class QueryFilterParser implements IQueryFilterParserService {
    public parse(query: string = ""): FilterOrGroups {
        if (!query.trim()) return [];
        return query.split("|").map((group) => this.parseAndGroup(group));
    }
    parseAndGroup(group: string): FilterAndGroup {
        return group
            .split("&")
            .map((token) => token.trim())
            .filter(Boolean)
            .map((token) => this.parseToken(token));
    }
    parseToken(rawToken: string): IFilterCondition {
        const negative = this.isNegated(rawToken);
        const token = negative ? rawToken.slice(1) : rawToken;

        if (this.isSpecialKeyword(token)) {
            return { type: "special", body: [token], negative: false };
        }

        if (token.startsWith("#")) {
            return { type: "tag", body: [token.slice(1)], negative };
        }

        return { type: "name", body: [token], negative };
    }

    isSpecialKeyword(token: string): boolean {
        return (SPECIAL_KEYWORDS as unknown as string[]).includes(token);
    }

    isNegated(query: string): boolean {
        return query.startsWith("!") && query.length > 1;
    }

}