import { describe, expect, it, vi } from 'vitest';
import { GetAdminUserWorkStatisticsUsecase } from './getAdminUserWorkStatistics.usecase';

describe('GetAdminUserWorkStatisticsUsecase', () => {
  const userId = '507f1f77bcf86cd799439011';
  const now = () => new Date('2026-10-18T20:00:00Z');
  const setup = () => ({
    findUser: vi.fn().mockResolvedValue({ _id: userId }),
    findUserWorkStatistics: vi.fn().mockResolvedValue({
      totalLists: 3,
      totalTasks: 20,
      daily: [
        { date: '2026-10-19', completedTasks: 5 },
        { date: '2026-10-17', completedTasks: 3 },
      ],
    }),
  });

  it('counts zero-completion days in the average and uses the Vietnam calendar', async () => {
    const repository = setup();
    const result = await new GetAdminUserWorkStatisticsUsecase(
      repository,
      now,
    ).execute({ userId, days: '7' });
    expect(result).toMatchObject({
      totalLists: 3,
      totalTasks: 20,
      completedTasks: 8,
      averageCompletedPerDay: 1.14,
      days: 7,
    });
    expect(result.daily).toHaveLength(7);
    expect(result.daily[0]).toEqual({ date: '2026-10-13', completedTasks: 0 });
    expect(result.daily[6]).toEqual({ date: '2026-10-19', completedTasks: 5 });
    expect(repository.findUserWorkStatistics).toHaveBeenCalledWith({
      userId,
      start: new Date('2026-10-12T17:00:00Z'),
      end: now(),
    });
  });

  it.each([undefined, 'invalid', '0'])(
    'defaults unsupported ranges to 30 days (%s)',
    async (days) => {
      const result = await new GetAdminUserWorkStatisticsUsecase(
        setup(),
        now,
      ).execute({ userId, days });
      expect(result.days).toBe(30);
      expect(result.averageCompletedPerDay).toBe(0.27);
    },
  );

  it('returns zeros for a user with no lists or tasks', async () => {
    const repository = setup();
    repository.findUserWorkStatistics.mockResolvedValue({
      totalLists: 0,
      totalTasks: 0,
      daily: [],
    });
    const result = await new GetAdminUserWorkStatisticsUsecase(
      repository,
      now,
    ).execute({ userId, days: '90' });
    expect(result.daily).toHaveLength(90);
    expect(result.averageCompletedPerDay).toBe(0);
    expect(result.completedTasks).toBe(0);
  });

  it('rejects invalid and missing users before loading their statistics', async () => {
    const repository = setup();
    const usecase = new GetAdminUserWorkStatisticsUsecase(repository, now);
    await expect(usecase.execute({ userId: 'invalid' })).rejects.toMatchObject({
      status: 400,
    });
    expect(repository.findUser).not.toHaveBeenCalled();
    repository.findUser.mockResolvedValue(null);
    await expect(usecase.execute({ userId })).rejects.toMatchObject({
      status: 404,
    });
    expect(repository.findUserWorkStatistics).not.toHaveBeenCalled();
  });
});
