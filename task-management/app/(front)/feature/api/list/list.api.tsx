import { axiosInstance } from '@/app/(front)/lib/axios';
import { IListModel, ITaskModel } from '@/app/(front)/model';
export const listApi = {
  getById: async (id: string): Promise<IListModel> => {
    const res = await axiosInstance.get<{
      list:IListModel
    }>(`/lists/${id}`);
    return res.data.list;
  },

  getAll:async (): Promise<IListModel[]> => {
    const res = await axiosInstance.get<{
      lists:IListModel[]
    }>(`/lists`);
    return res.data.lists;
  },

  create: async (data: Pick<ITaskModel,"name">): Promise<IListModel> => {
    const res = await axiosInstance.post<{list:IListModel}>('/lists', data);
    return res.data.list;
  },

  delete: async (id:string): Promise<IListModel> => {
    const res = await axiosInstance.delete<{list:IListModel}>('/lists/'+id);
    return res.data.list;
  },

  update: async (id: string, name:string): Promise<IListModel> => {
    const res = await axiosInstance.put<{
      list:IListModel
    }>(`/lists/${id}`, {name:name});
    return res.data.list;
  },
  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/tasks/${id}`);
  },

    changePosition: async (
      listId:string,
      fromId: string,
      toId: string
    ): Promise<boolean> => {

      const res = await axiosInstance.patch(`/lists/${listId}`, { fromId,toId });
      return res.data;
    },
};