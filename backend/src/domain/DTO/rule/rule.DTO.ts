
import { IRuleWithId } from "@/domain/entities";

export type ICreateRuleDTO = Pick<IRuleWithId,"id"|"priority"|"tags"|"repeat"|"timer"|"end_date"|"start_date"|"endTimer"> & {
  repeat: {
    mode: string;
    every: number;
    days: number[];
    dates: number[];
    specificDays: Date[];
  },
  tags:string[],
   
};
