import { axiosInstance } from '@/app/(front)/lib/axios';
import { ITaskModel } from '@/app/(front)/model';
import { ICreateTaskDTO, ICreateTaskWithSectionDTO, IUpdateTaskDTO } from '@/app/(front)/model/DTO/task.DTO';
import { IRuleModel } from '@/app/(front)/model/rule/rule.model';
import { IStatus } from '@/app/(front)/model/type/type';

export const taskApi = {
  getById: async (id: string): Promise<ITaskModel> => {
    const res = await axiosInstance.get<{
      task:ITaskModel
    }>(`/tasks/${id}`);
    return res.data.task;
  },

  getTaskWithIds: async (ids: string[],listId:string): Promise<ITaskModel[]> => {
    const res = await axiosInstance.post<{
      tasks:ITaskModel[]
    }>(`lists/${listId}/tasks/by_ids`,{
      ids:ids
    });
    console.log(res)
    return res.data.tasks;
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
    createTaskWithSectionInObject:async (data:ICreateTaskWithSectionDTO):Promise<ITaskModel>=>{
    const res = await axiosInstance.post<{
      task:ITaskModel
    }>(`/lists/${data.list}/sections/${data.section}/tasks`, data);
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

updateStatus: async (id: string, data:{
  id:string,
  record:Record<string,{
    date:Date,
    rule:string
  }>,
  status:IStatus
} ): Promise<ITaskModel> => {
  const res = await axiosInstance.patch(`/tasks/${id}/status`, data)
  console.log(res)
  return res.data.result
}
};