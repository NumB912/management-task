import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ICreateTaskDTO, ICreateTaskWithSectionDTO, IUpdateTaskDTO } from '../../model/DTO/task.DTO';
import { taskApi } from '../api/task/task.api';
import { IUpdateRuleDTO } from '../../model/DTO/rule.DTO';
import { useWorkspaceStore } from '../store/workspace.state';
import { IStatus } from '../../model/type/type';
import { ITypeColor } from '../../model/color.model';

type CreateTaskInput = ICreateTaskDTO | ICreateTaskWithSectionDTO;

export const useCreateTask = () => {
  return useMutation({
    mutationFn: (data: CreateTaskInput) => {
      const section =
        ("section" in data ? data.section : undefined);
      const list = ("list" in data ? data.list : undefined);

      if (section && list) {
        return taskApi.createTaskWithSection(
          data as ICreateTaskWithSectionDTO,
          list,
          section,
        );
      }
      
      return taskApi.create(data as ICreateTaskDTO, list!);
    },
  });
};

export const useCreateTaskWithSectionObject = () => {
  return useMutation({
    mutationFn: (data: ICreateTaskWithSectionDTO) =>
      taskApi.createTaskWithSectionInObject(data),
  });
};


export const useUpdateTask = (listId: string) => {
  return useMutation({
    mutationFn: ({ data, taskId }: { taskId: string; data: Partial<IUpdateTaskDTO> }) =>
      taskApi.update(taskId, data),
    onSuccess: async (_data, { taskId }) => {
      try {
        const task = await taskApi.getById(taskId);
        useWorkspaceStore.getState().updateTask(taskId, task);
      } catch (error) {
        console.error('Không thể tải lại task sau khi cập nhật', error);
      }
    },
  });
};

export const useUpdateRule = (listId: string) => {
  return useMutation({
    mutationFn: ({ data, taskId }: { taskId: string; data: IUpdateRuleDTO }) =>
      taskApi.ruleUpdate(taskId, data),
    onSuccess: async (_data, { taskId }) => {
      try {
        const task = await taskApi.getById(taskId);
        useWorkspaceStore.getState().updateRule(taskId, task.rule);
      } catch (error) {
        console.error('Không thể tải lại rule sau khi cập nhật', error);
      }
    },
  });
};

export const useRemoveTask = (listId?: string) => {
  return useMutation({
    mutationFn: (id: string) => taskApi.remove(id),
  });
};

export const useUpdateColor = ()=>{
  return useMutation({
    mutationFn: (dto:{id:string,color:string,type:ITypeColor}) => taskApi.updateColor(dto),
  });
}


export const useUpdateTaskStatus = () => {
  return useMutation({
    mutationFn: ({ data, taskId }: { taskId: string; data:{
      id:string,
      record:Record<string, {
        date:Date,
        rule:string
      }>,
      status:IStatus
    } }) =>
      taskApi.updateStatus(taskId, data),
 });
};

export const useUpdateTaskStatusBulk = () => {
  return useMutation({
    mutationFn: (data:{
      id:string,
      type:"recurring"|"single"
      record:Record<string, {
        date:Date,
        rule:string
      }>|undefined,
      status:IStatus
    }[]) =>
      taskApi.updateStatusBulk(data),
 });
};
