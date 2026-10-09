export interface IRepeat {
  mode: IModeRepeat,
  every?: number,
  dates?: number[],
  days?: number[],
  specificDays?: Date[]
  until?:Date|null
}

export type IModeRepeat = "week" | "day"| "none"|"month"|"specificday"

export interface IRule {
  id: string;
  task: string,
  path: string;
  start_date?: Date|null;
  list:string,
  end_date?: Date|null;
  endTimer?:number|null;
  timer?: number|null;
  color:string,
  repeat: IRepeat;
  tags: string[],
  priority?: 1 | 2 | 3 | 4,
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}


export interface IRuleWithId extends IRule {
}