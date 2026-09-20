import { axiosInstance } from '@/app/(front)/lib/axios';
import { ISectionModel } from '@/app/(front)/model';
export const sectionApi = {
  getById: async (id: string,listId:string): Promise<ISectionModel> => {
    const res = await axiosInstance.get<{
      section:ISectionModel
    }>(`/sections/${id}`);
    return res.data.section;
  },

  getAll:async (listId:string): Promise<ISectionModel[]> => {
    const res = await axiosInstance.get<{
      sections:ISectionModel[]
    }>(`/lists/${listId}/sections`);
    return res.data.sections;
  },

  create: async (data: Pick<ISectionModel,"name">,listId:string): Promise<ISectionModel> => {
    const res = await axiosInstance.post<{section:ISectionModel}>(`/lists/${listId}/sections`, data);
    console.log(res.data.section)
    return res.data.section;
  },

  delete: async (id:string): Promise<ISectionModel> => {
    const res = await axiosInstance.delete<{section:ISectionModel}>('/sections/'+id);
    return res.data.section;
  },

  update: async (id: string,name:string): Promise<ISectionModel> => {
    const res = await axiosInstance.put<{
      section:ISectionModel
    }>(`/sections/${id}`, {name:name});
    return res.data.section;
  },
  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/sections/${id}`);
  },

  changePosition: async (
    orderMainId: string,
    orderChangeId: string
  ): Promise<ISectionModel> => {
    const res = await axiosInstance.patch<{
      section: ISectionModel;
    }>(`/sections/${orderMainId}/change-position`, { orderChangeId });
    return res.data.section;
  },
};