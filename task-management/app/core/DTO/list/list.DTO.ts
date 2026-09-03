import { IList, IListPartial } from "../../domain";

export interface DashboardListsResult {
  lists: { list:{
    id:string,
    sections: { id: string, name: string }[],
    isShareList: boolean,
    name: string,
    user: string,
  }
  , taskCount: number }[];
  inbox: { taskCount: number } | null;
  today: {  taskCount: number }[];
  next7Days: { taskCount: number }[];
}
