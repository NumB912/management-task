import { axiosInstance } from '@/app/(front)/lib/axios';
import { ITaskModel } from '@/app/(front)/model';
import { IFilterModel } from '@/app/(front)/model/filter.model';

type ICreateFilterPayload = Omit<IFilterModel, "id" | "user">;

export const filterApi = {
  getById: async (id: string): Promise<{
      filter: IFilterModel,tasks:ITaskModel[]
    }> => {
    const res = await axiosInstance.get<{
      filter: IFilterModel,tasks:ITaskModel[]
    }>(`/filters/${id}`);
    console.log(res)
    return res.data;
  },

  getAll: async (): Promise<IFilterModel[]> => {
    const res = await axiosInstance.get<{
      filters: IFilterModel[]
    }>(`/filters`);
    return res.data.filters;
  },

  create: async (data: ICreateFilterPayload): Promise<IFilterModel> => {
        console.log(data)
    const res = await axiosInstance.post<{ filter: IFilterModel }>('/filters', data);

    return res.data.filter;
  },

  delete: async (id: string): Promise<IFilterModel> => {
    const res = await axiosInstance.delete<{ filter: IFilterModel }>('/filters/' + id);
    return res.data.filter;
  },

  update: async (id: string, data: Partial<ICreateFilterPayload>): Promise<IFilterModel> => {
    const res = await axiosInstance.patch<{
      filter: IFilterModel
    }>(`/filters/${id}`, data);
    return res.data.filter;
  },
};