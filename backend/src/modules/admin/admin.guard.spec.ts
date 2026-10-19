import { describe, it, expect, vi } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from '@/infrastructure/guards/admin.guard';
import { AdminRepository } from '@/infrastructure/repositories/admin.repository';
import { CheckAdminUsecase } from '@/application/usecase/admin/checkAdmin.usecase';
import { DatabaseModels } from '@/infrastructure/repositories/database/clientSchema.database';

describe('AdminGuard', () => {
  const id = '507f1f77bcf86cd799439011';
  const context = (user?: object) => ({ switchToHttp: () => ({ getRequest: () => ({ user }) }) }) as ExecutionContext;

  it('rejects missing identity without querying the database', async () => {
    const exists = vi.fn();
    const guard = new AdminGuard(new CheckAdminUsecase(new AdminRepository({ User: { exists } } as unknown as DatabaseModels)));
    await expect(guard.canActivate(context())).rejects.toBeInstanceOf(ForbiddenException);
    expect(exists).not.toHaveBeenCalled();
  });

  it('rejects an old admin claim when the database no longer grants admin', async () => {
    const exists = vi.fn().mockResolvedValue(null);
    const guard = new AdminGuard(new CheckAdminUsecase(new AdminRepository({ User: { exists } } as unknown as DatabaseModels)));
    await expect(guard.canActivate(context({ id, role: 'admin' }))).rejects.toBeInstanceOf(ForbiddenException);
    expect(exists).toHaveBeenCalledWith({ _id: id, role: 'admin', deleted_at: null, blocked: { $ne: true } });
  });

  it('allows a current active database admin', async () => {
    const exists = vi.fn().mockResolvedValue({ _id: id });
    const guard = new AdminGuard(new CheckAdminUsecase(new AdminRepository({ User: { exists } } as unknown as DatabaseModels)));
    await expect(guard.canActivate(context({ id }))).resolves.toBe(true);
  });
});
