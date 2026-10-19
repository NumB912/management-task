import { describe, expect, it, vi } from 'vitest';
import { GetAdminUsersUsecase } from './getAdminUsers.usecase';

describe('GetAdminUsersUsecase', () => {
  it('normalizes pagination and search before passing to the repository', async () => {
    const repository = { isActiveAdmin: vi.fn(), findUsers: vi.fn().mockResolvedValue({ users: [] }) };
    await new GetAdminUsersUsecase(repository).execute({ page: '-3', search: '  alice  ' });
    expect(repository.findUsers).toHaveBeenCalledWith({ page: 1, pageSize: 20, search: 'alice' });
  });
  it('bounds very large pages and search lengths', async () => {
    const repository = { isActiveAdmin: vi.fn(), findUsers: vi.fn().mockResolvedValue({ users: [] }) };
    await new GetAdminUsersUsecase(repository).execute({ page: 'Infinity', search: 'a'.repeat(200) });
    expect(repository.findUsers).toHaveBeenCalledWith({ page: 10000, pageSize: 20, search: 'a'.repeat(100) });
  });
});
