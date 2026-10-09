import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ICreateTaskDTO, ICreateTaskWithSectionDTO, IUpdateTaskDTO } from '../../model/DTO/task.DTO';
import { taskApi } from '../api/task/task.api';
import { IRuleModel } from '../../model/rule/rule.model';
import { IStatus } from '../../model/type/type';

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
  });
};

export const useUpdateRule = (listId: string) => {
  return useMutation({
    mutationFn: ({ data, taskId }: { taskId: string; data: Partial<IRuleModel> }) =>
      taskApi.ruleUpdate(taskId, data),
  });
};

export const useRemoveTask = (listId?: string) => {
  return useMutation({
    mutationFn: (id: string) => taskApi.remove(id),
  });
};


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
