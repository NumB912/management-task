
import { useMutation, useQuery } from '@tanstack/react-query';
import { taskApi } from '../api/task/task.api';


export const taskKeys = {
  all: ['tasks'] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskApi.getById(id),
    enabled: !!id,
  });
};


export const useTaskWithIds = () => {
  return useMutation({
    mutationFn: ({ ids, listId }: { ids: string[]; listId: string }) =>
      taskApi.getTaskWithIds(ids, listId),
  });
};