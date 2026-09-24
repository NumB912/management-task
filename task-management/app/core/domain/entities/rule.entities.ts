export interface IRepeat {
  mode: string,
  every?: number,
  dates?: number[],
  days?: number[],
  specificDays?: Date[]
  until?:Date|null
}

export interface IRule {
  id: string;
  task?: string|null,
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