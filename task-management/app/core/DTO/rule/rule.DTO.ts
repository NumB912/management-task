
import { IRuleWithId } from "../../domain/entities/rule.entities";

export type ICreateRuleDTO = Pick<IRuleWithId,"priority"|"tags"|"repeat"|"timer"|"end_date"|"start_date"> & {
  repeat: {
    mode: string;
    every: number;
    days: number[];
    dates: number[];
    specificDays: Date[];
  },
  tags:string[],
   
};
