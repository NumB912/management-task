import { axiosInstance } from '@/app/(front)/lib/axios';
import { ITaskModel } from '@/app/(front)/model';
import { ICreateTaskDTO, IUpdateTaskDTO } from '@/app/(front)/model/DTO/task.DTO';
import { IRuleModel } from '@/app/(front)/model/rule/rule.model';

export const taskApi = {
  getById: async (id: string): Promise<ITaskModel> => {
    const res = await axiosInstance.get<{
      task:ITaskModel
    }>(`/tasks/${id}`);
    return res.data.task;
  },
  create: async (data: ICreateTaskDTO,listId:string): Promise<{
    id:String
  }> => {
    const res = await axiosInstance.post<{
      task:{
        id:string
      }
    }>(`/lists/${listId}/tasks`, data);

    return res.data.task;
  },

  createTaskWithSection:async (data:ICreateTaskDTO,listId:string,sectionId:string):Promise<ITaskModel>=>{
    const res = await axiosInstance.post<{
      task:ITaskModel
    }>(`/lists/${listId}/sections/${sectionId}/tasks`, data);
    return res.data.task;
  },
  update: async (id: string, data: Partial<IUpdateTaskDTO>): Promise<{task:ITaskModel}> => {
    const res = await axiosInstance.patch<{
      task:ITaskModel
    }>(`/tasks/${id}`, data);
    return res.data;
  },


  ruleUpdate:async (id:string,data:Partial<IRuleModel>):Promise<{rule:IRuleModel}>=>{
    const res = await axiosInstance.patch<{
      rule:ITaskModel
    }>(`/tasks/${id}/rule`, data);
    return res.data.rule;
  },
  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/tasks/${id}`);
  },

updateStatus: async (id: string, status: Pick<ITaskModel, "status">): Promise<ITaskModel> => {
  const res = await axiosInstance.patch(`/tasks/${id}/status`, status)
  return res.data.data
}
};