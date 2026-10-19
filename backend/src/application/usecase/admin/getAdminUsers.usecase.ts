import type { IAdminRepository, AdminUsersPage } from '@/domain/repositories/IAdmin.repository.js';

export class GetAdminUsersUsecase {
  constructor(private readonly repository: Pick<IAdminRepository, 'findUsers'>) {}
  execute(input: { page?: string; search?: string }): Promise<AdminUsersPage> {
    const page = Math.max(1, Math.min(10000, Math.floor(Number(input.page) || 1)));
    return this.repository.findUsers({ page, pageSize: 20, search: (input.search ?? '').trim().slice(0, 100) });
  }
}
