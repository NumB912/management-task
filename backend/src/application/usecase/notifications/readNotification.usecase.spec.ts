import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadedNotificationUsecase } from './readNotification.usecase.js';
import { AppError } from '@/domain/errors/appError.errors';
import type { INotificationRepository } from '@/domain/repositories/INotification.repository';

function setup() {
  const updateBy = vi.fn<INotificationRepository['updateBy']>().mockResolvedValue(true);
  const repository = { updateBy } as unknown as INotificationRepository;
  return { usecase: new ReadedNotificationUsecase(repository), updateBy };
}

describe('ReadedNotificationUsecase', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('marks only the current user unread notifications as read', async () => {
    const { usecase, updateBy } = setup();

    await expect(usecase.execute('user-1')).resolves.toBe(true);

    expect(updateBy).toHaveBeenCalledExactlyOnceWith(
      { user: 'user-1', is_read: false }, { is_read: true },
    );
  });

  it('rejects a missing user without updating notifications', async () => {
    const { usecase, updateBy } = setup();

    await expect(usecase.execute('')).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
    expect(updateBy).not.toHaveBeenCalled();
  });

  it('preserves a false result from the repository', async () => {
    const { usecase, updateBy } = setup();
    updateBy.mockResolvedValue(false);

    await expect(usecase.execute('user-1')).resolves.toBe(false);
  });

  it('preserves known application errors', async () => {
    const { usecase, updateBy } = setup();
    const failure = new AppError('FORBIDDEN', 'Access denied', 403);
    updateBy.mockRejectedValue(failure);

    await expect(usecase.execute('user-1')).rejects.toBe(failure);
  });

  it('wraps unexpected database failures as internal errors', async () => {
    const { usecase, updateBy } = setup();
    updateBy.mockRejectedValue(new Error('Database unavailable'));

    await expect(usecase.execute('user-1')).rejects.toMatchObject({ code: 'ERROR', status: 500 });
  });
});
