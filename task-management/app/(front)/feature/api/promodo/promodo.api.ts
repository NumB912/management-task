import { axiosInstance } from '@/app/(front)/lib/axios';
import { ICreatePromodoDTO } from '@/app/(front)/model/DTO/promodo.DTO';
import { IPromodoroModel } from '@/app/(front)/model/promodo.model';
export const promodoApi = {
  getAll:async (): Promise<IPromodoroModel[]> => {
    const res = await axiosInstance.get<{
      data:IPromodoroModel[]
    }>(`/promodo`);
    return res.data.data;
  },

  create: async (data: ICreatePromodoDTO): Promise<IPromodoroModel> => {
    const res = await axiosInstance.post<{data:IPromodoroModel}>('/promodo', data);
    return res.data.data;
  },
};