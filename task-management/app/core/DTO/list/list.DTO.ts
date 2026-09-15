import { IList, IListPartial } from "../../domain";

export interface DashboardListsResult {
  lists: { list:IList
  , taskCount: number }[];
  inbox: { taskCount: number } | null;
  today: {  taskCount: number }[];
  next7Days: { taskCount: number }[];
}
