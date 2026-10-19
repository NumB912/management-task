
import { useQuery } from '@tanstack/react-query';
import { filterApi } from '../api/filters/filter.api';

export const filterKeys = {
  all: ['filters'] as const,
  tags: () => [...filterKeys.all, 'filters'] as const,
  detail: (id: string) => [...filterKeys.all, 'detail', id] as const,
};

export const useFilter = (id: string) => {
  return useQuery({
    queryKey: filterKeys.detail(id),
    queryFn: () => filterApi.getById(id),
    enabled: !!id,
  });
};