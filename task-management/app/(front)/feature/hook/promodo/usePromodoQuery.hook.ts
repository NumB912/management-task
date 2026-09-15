
import { useQuery } from '@tanstack/react-query';
import { promodoApi } from '../../api/promodo/promodo.api';

export const usePromodo = () => {
  return useQuery({
    queryKey: [""],
    queryFn: () => promodoApi.getAll(),
  });
};