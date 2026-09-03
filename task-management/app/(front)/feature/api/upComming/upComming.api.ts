import { axiosInstance } from '@/app/(front)/lib/axios';
import { ITaskModel } from '@/app/(front)/model';
export const upCommingApi = {
  getToday: async (): Promise<{
    overDue:ITaskModel[],
    upComming:ITaskModel[]
  }> => {
    const res = await axiosInstance.get<{
      overDue:ITaskModel[],
      upComming:ITaskModel[]
    }>(`/tasks/upComming`);
    console.log(res.data)
    return res.data;
  },

};