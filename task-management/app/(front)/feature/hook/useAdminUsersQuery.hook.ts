import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin/admin.api';

export function useAdminUsersQuery(search: string, page: number) {
  return useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => adminApi.getUsers({ search, page }),
    retry: false,
  });
}
