import { describe, expect, it, vi } from 'vitest';
import { AdminRepository } from './admin.repository';
import type { DatabaseModels } from './database/clientSchema.database';

describe('AdminRepository user statistics', () => {
  it('counts tasks only in non-deleted owned lists and uses actual completion dates', async () => {
    const listIds = ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'];
    const find = vi
      .fn()
      .mockReturnValue({
        select: vi
          .fn()
          .mockReturnValue({
            lean: vi.fn().mockResolvedValue(listIds.map((_id) => ({ _id }))),
          }),
      });
    const aggregate = vi
      .fn()
      .mockResolvedValue([
        {
          totals: [{ count: 12 }],
          daily: [{ date: '2026-10-19', completedTasks: 4 }],
        },
      ]);
    const repository = new AdminRepository({
      List: { find },
      Task: { aggregate },
    } as unknown as DatabaseModels);
    const userId = '507f1f77bcf86cd799439011';
    const start = new Date('2026-10-12T17:00:00Z');
    const end = new Date('2026-10-19T02:00:00Z');
    const result = await repository.findUserWorkStatistics({
      userId,
      start,
      end,
    });
    expect(String(find.mock.calls[0][0].user)).toBe(userId);
    expect(find.mock.calls[0][0].deleted_at).toBeNull();
    expect(aggregate.mock.calls[0][0][0]).toEqual({
      $match: { list: { $in: listIds }, deleted_at: null },
    });
    expect(aggregate.mock.calls[0][0][1].$facet.daily[0]).toEqual({
      $match: { status: 'done', done_at: { $gte: start, $lte: end } },
    });
    expect(result).toEqual({
      totalLists: 2,
      totalTasks: 12,
      daily: [{ date: '2026-10-19', completedTasks: 4 }],
    });
  });

  it('does not query tasks for a user without owned lists', async () => {
    const aggregate = vi.fn();
    const repository = new AdminRepository({
      List: {
        find: vi
          .fn()
          .mockReturnValue({
            select: vi
              .fn()
              .mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }),
          }),
      },
      Task: { aggregate },
    } as unknown as DatabaseModels);
    await expect(
      repository.findUserWorkStatistics({
        userId: '507f1f77bcf86cd799439011',
        start: new Date(),
        end: new Date(),
      }),
    ).resolves.toEqual({ totalLists: 0, totalTasks: 0, daily: [] });
    expect(aggregate).not.toHaveBeenCalled();
  });

  it('keeps global statistics independent of search and returns only public account fields', async () => {
    const document = {
      _id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      role: 'user',
      created_at: new Date(),
      password: 'never-return-this',
    };
    const query = {
      select: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([document]),
    };
    const User = {
      find: vi.fn().mockReturnValue(query),
      countDocuments: vi
        .fn()
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(12)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3),
    };
    const repository = new AdminRepository({
      User,
    } as unknown as DatabaseModels);
    const result = await repository.findUsers({
      page: 1,
      pageSize: 20,
      search: 'Alice',
    });
    expect(result).toMatchObject({
      total: 1,
      admins: 2,
      totalUsers: 12,
      regularUsers: 10,
      newUsersLast30Days: 3,
    });
    expect(User.countDocuments).toHaveBeenNthCalledWith(3, {
      deleted_at: null,
    });
    expect(User.countDocuments).toHaveBeenNthCalledWith(4, {
      role: 'user',
      deleted_at: null,
    });
    expect(User.countDocuments).toHaveBeenNthCalledWith(5, {
      deleted_at: null,
      created_at: { $gte: expect.any(Date) },
    });
    expect(result.users[0]).not.toHaveProperty('password');
    expect(query.select).toHaveBeenCalledWith(
      '_id name email role blocked created_at',
    );
  });

  it('updates public fields and atomically excludes admin accounts from locking', async () => {
    const lean = vi
      .fn()
      .mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'user',
        created_at: new Date(),
        blocked: true,
      });
    const update = vi
      .fn()
      .mockReturnValue({ select: vi.fn().mockReturnValue({ lean }) });
    const repository = new AdminRepository({
      User: { findOneAndUpdate: update },
    } as unknown as DatabaseModels);
    const id = '507f1f77bcf86cd799439011';
    await repository.updateUser(
      id,
      { name: 'Alice', blocked: true },
      { excludeAdmins: true },
    );
    expect(update).toHaveBeenCalledWith(
      { _id: id, deleted_at: null, role: { $ne: 'admin' } },
      { $set: { name: 'Alice', blocked: true, updated_at: expect.any(Date) } },
      { new: true, runValidators: true },
    );
  });
});
