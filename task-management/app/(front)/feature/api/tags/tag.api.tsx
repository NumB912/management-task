import { axiosInstance } from '@/app/(front)/lib/axios';
import { ITagModel, ITaskModel } from '@/app/(front)/model';
export const tagApi = {
  getById: async (id: string): Promise<{
    tag:ITagModel,
    tasks:ITaskModel[]
  }> => {
    const res = await axiosInstance.get<{
      tag:ITagModel,
      tasks:ITaskModel[]
    }>(`/tags/${id}`);

    return res.data
  },

  
  create: async (data: Pick<ITagModel,"name">): Promise<ITagModel> => {
    const res = await axiosInstance.post<{tag:ITagModel}>('/tags', data);
    return res.data.tag;
  },

  updateOnlyMe: async (id: string, data:Omit<ITagModel,"id">): Promise<ITagModel> => {
    const res = await axiosInstance.put<{
      tag:ITagModel
    }>(`/tags/${id}/onlyMe`, data);
    return res.data.tag;
  },
  updateShareWithMe:async (id: string,data:Omit<ITagModel,"id">): Promise<ITagModel> => {
    const res = await axiosInstance.put<{
      tag:ITagModel
    }>(`/tags/${id}/withShare`, data);
    return res.data.tag;
  },
  removeOnlyMe: async (id:string): Promise<ITagModel> => {
    const res = await axiosInstance.delete<{tag:ITagModel}>(`/tags/${id}/onlyMe`);
    return res.data.tag;
  },
  removeWithShare: async (id:string): Promise<ITagModel> => {
    const res = await axiosInstance.delete<{tag:ITagModel}>(`/tags/${id}/withShare`);
    return res.data.tag;
  }
};