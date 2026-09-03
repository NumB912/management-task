// features/list/hooks/useListQuery.ts
import { useQuery } from '@tanstack/react-query';
import { listApi } from '../api/list/list.api';

export const listKeys = {
  all: ['lists'] as const,
  lists: () => [...listKeys.all, 'list'] as const,
  detail: (id: string) => [...listKeys.all, 'detail', id] as const,
};

export const useLists = () => {
  return useQuery({
    queryKey: listKeys.lists(),
    queryFn: () => listApi.getAll(),
  });
};

export const useList = (id: string) => {
  return useQuery({
    queryKey: listKeys.detail(id),
    queryFn: () => listApi.getById(id),
    enabled: !!id,
  });
};