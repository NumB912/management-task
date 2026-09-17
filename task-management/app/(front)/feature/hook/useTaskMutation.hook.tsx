import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ICreateTaskDTO, ICreateTaskWithSectionDTO, IUpdateTaskDTO } from '../../model/DTO/task.DTO';
import { taskApi } from '../api/task/task.api';
import { listKeys } from './useListQuery.hook';
import { taskKeys } from './useTaskQuery.hook';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from './apiErrorResponse.type';
import { IRuleModel } from '../../model/rule/rule.model';
import { useWorkspaceStore } from '../../states/workspace.state';
import { todayKeys } from './useToday.hook';
import { inboxKeys } from './useInbox.hook';
import { IListModel, ITaskModel } from '../../model';
import { useShallow } from 'zustand/react/shallow';

export const useCreateTask = (listId: string) => {
  return useMutation({
    mutationFn: (data: ICreateTaskDTO) => taskApi.create(data, listId),
  });
};

export const useCreateTaskWithSection = (listId: string, sectionId: string) => {
  return useMutation({
    mutationFn: (data: ICreateTaskWithSectionDTO) =>
      taskApi.createTaskWithSection(data, listId, sectionId),
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


export const useUpdateTaskStatus = (listId:string) => {
  const addTask = useWorkspaceStore(useShallow((state)=>state.addTask))
  return useMutation({
    mutationFn: ({ data, taskId }: { taskId: string; data:Pick<ITaskModel,"status"> }) =>
      taskApi.updateStatus(taskId, data),
    onSuccess:(data)=>{
        if (data.rule?.repeat?.mode !== "none") {
        addTask(data, data.list, data.section)
      }
    }
 });
};
