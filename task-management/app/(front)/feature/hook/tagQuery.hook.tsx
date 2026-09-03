
import { useQuery } from '@tanstack/react-query';
import { tagApi } from '../api/tags/tag.api';

export const tagKeys = {
  all: ['tags'] as const,
  tags: () => [...tagKeys.all, 'tag'] as const,
  detail: (id: string) => [...tagKeys.all, 'detail', id] as const,
};

export const useTag = (id: string) => {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: () => tagApi.getById(id),
    enabled: !!id,
  });
};