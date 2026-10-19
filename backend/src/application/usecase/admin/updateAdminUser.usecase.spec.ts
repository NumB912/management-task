import { describe, expect, it, vi } from 'vitest';
import { UpdateAdminUserUsecase } from './updateAdminUser.usecase';

describe('UpdateAdminUserUsecase', () => {
  const id = '507f1f77bcf86cd799439011';
  it('rejects self-demotion and self-locking without writing', async () => {
    const updateUser = vi.fn();
    const usecase = new UpdateAdminUserUsecase({ updateUser });
    await expect(usecase.execute(id, id, { role: 'user' })).rejects.toMatchObject({ status: 400 });
    await expect(usecase.execute(id, id.toUpperCase(), { blocked: true })).rejects.toMatchObject({ status: 400 });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('validates fields and prevents mass assignment without writing', async () => {
    const updateUser = vi.fn();
    const usecase = new UpdateAdminUserUsecase({ updateUser });
    for (const body of [null, [], {}, { name: ' ' }, { name: 'a'.repeat(101) }, { role: 'owner' }, { blocked: 'false' }, { password: 'changed' }]) {
      await expect(usecase.execute('another-admin', id, body)).rejects.toMatchObject({ status: 400 });
    }
    await expect(usecase.execute('another-admin', 'invalid', { name: 'Alice' })).rejects.toMatchObject({ status: 400 });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('normalizes the name and requests atomic admin protection when locking', async () => {
    const updateUser = vi.fn().mockResolvedValue({ _id: id, name: 'Alice', blocked: true });
    const result = await new UpdateAdminUserUsecase({ updateUser }).execute('another-admin', id, { name: ' Alice ', blocked: true });
    expect(updateUser).toHaveBeenCalledWith(id, { name: 'Alice', blocked: true }, { excludeAdmins: true });
    expect(result.blocked).toBe(true);
  });

  it('permits promotion and unlocking, and reports a rejected conditional write', async () => {
    const updateUser = vi.fn().mockResolvedValueOnce({ _id: id }).mockResolvedValueOnce(null);
    const usecase = new UpdateAdminUserUsecase({ updateUser });
    await usecase.execute('another-admin', id, { role: 'admin', blocked: false });
    expect(updateUser).toHaveBeenCalledWith(id, { role: 'admin', blocked: false }, { excludeAdmins: false });
    await expect(usecase.execute('another-admin', id, { blocked: true })).rejects.toMatchObject({ status: 400 });
  });
});
