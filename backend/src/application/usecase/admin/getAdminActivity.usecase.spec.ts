import { describe, expect, it, vi } from 'vitest';
import { GetAdminActivityUsecase } from './getAdminActivity.usecase';

describe('GetAdminActivityUsecase', () => {
  const empty = { daily: [], hourly: [], summary: { sessions: 0, activeUsers: 0 } };
  it('uses the Vietnam calendar date across UTC midnight and fills missing buckets', async () => {
    const repository = { findUser: vi.fn(), findActivity: vi.fn().mockResolvedValue(empty) };
    const usecase = new GetAdminActivityUsecase(repository, () => new Date('2026-10-18T20:00:00Z'));
    const result = await usecase.execute({ days: '7' });
    expect(repository.findActivity).toHaveBeenCalledWith({ start: new Date('2026-10-12T17:00:00Z'), end: new Date('2026-10-18T20:00:00Z'), userId: undefined });
    expect(result.daily).toHaveLength(7);
    expect(result.daily[0].date).toBe('2026-10-13');
    expect(result.daily[6].date).toBe('2026-10-19');
    expect(result.hourly).toHaveLength(24);
    expect(result.summary.sessions).toBe(0);
  });

  it('rejects malformed or missing users before aggregating activity', async () => {
    const repository = { findUser: vi.fn().mockResolvedValue(null), findActivity: vi.fn() };
    const usecase = new GetAdminActivityUsecase(repository);
    await expect(usecase.execute({ userId: 'invalid' })).rejects.toMatchObject({ status: 400 });
    expect(repository.findUser).not.toHaveBeenCalled();
    await expect(usecase.execute({ userId: '507f1f77bcf86cd799439011' })).rejects.toMatchObject({ status: 404 });
    expect(repository.findActivity).not.toHaveBeenCalled();
  });

  it('scopes user activity and preserves real buckets with the default 30-day range', async () => {
    const user = { _id: '507f1f77bcf86cd799439011' };
    const repository = {
      findUser: vi.fn().mockResolvedValue(user),
      findActivity: vi.fn().mockResolvedValue({ daily: [{ date: '2026-10-19', sessions: 2, activeUsers: 1 }], hourly: [{ hour: 9, sessions: 2 }], summary: { sessions: 2, activeUsers: 1 } }),
    };
    const result = await new GetAdminActivityUsecase(repository, () => new Date('2026-10-19T02:00:00Z')).execute({ days: 'invalid', userId: user._id });
    expect(result.days).toBe(30);
    expect(result.user).toBe(user);
    expect(result.daily[29].sessions).toBe(2);
    expect(result.hourly[9].sessions).toBe(2);
    expect(repository.findActivity).toHaveBeenCalledWith(expect.objectContaining({ userId: user._id }));
  });
});
