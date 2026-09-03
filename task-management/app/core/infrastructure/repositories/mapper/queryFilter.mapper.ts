import { IFilterCondition } from "@/app/core/domain/type/filterLogic.type";


export class MongoQueryMapper {
    private buildClaude(condition: IFilterCondition){
        switch(condition.type){
            case "tag":
                return condition.negative?{
                    "tags.name":{
                        $in:[condition.body]
                    },
                }:{
                    "tags.name":{
                        $ne:[condition.body]
                    }
                };
            case "special":
                return condition.body.map((bodySpecial)=>(this.buildSpecialClaude(bodySpecial)))
            case "name":
                return {}
            default:
                return {}
        }
    }

    private buildSpecialClaude(keyWord: string) {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        switch (keyWord) {
            case "today":
                return {
                    start_date: {
                        $lte: startOfToday,
                    },
                    end_date: {
                        $gte: endOfToday
                    }
                }
            case "overdue":
                return {
                    start_date: {
                        $gt: endOfToday
                    },
                    status: "pending"
                }
            case "done":
                return {
                    status: "done"
                }
            case "won't do":
                return {
                    status: "won't do"
                }
            default:
                return {}
        }
    }

    private buildTagClaude(){
        return {

        }
    }


}