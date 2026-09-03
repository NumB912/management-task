import { axiosInstance } from '@/app/(front)/lib/axios';
import { ITaskModel } from '@/app/(front)/model';
export const todayApi = {
  getToday: async (): Promise<{
    overDue:ITaskModel[],
    today:ITaskModel[]
  }> => {
    const res = await axiosInstance.get<{
      getToday:{
    overDue:ITaskModel[],
    today:ITaskModel[]
  }
    }>(`/tasks/today`);
    return res.data.getToday;
  },

};