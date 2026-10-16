import { describe, expect, it, vi } from 'vitest';
import { Types } from 'mongoose';
import { StatisticsRepository } from './statistics.repository.js';
import type { DatabaseModels } from './database/clientSchema.database.js';
import { statisticsPeriod } from '@/application/service/statistics.service.js';

describe('statistics access scope', () => {
  it('limits tasks to owned or accepted lists and excludes deleted records', async () => {
    const user = new Types.ObjectId();
    const list = new Types.ObjectId();
    const memberFind = vi.fn(() => ({
      select: () => ({ lean: async () => [{ list }] }),
    }));
    const listFind = vi.fn(() => ({
      select: () => ({ lean: async () => [{ _id: list }] }),
    }));
    const aggregate = vi.fn(() => ({ exec: async () => [] }));
    const db = {
      Member: { find: memberFind },
      List: { find: listFind },
      Task: { aggregate },
      Rule: { collection: { name: 'rules' } },
    };
    await new StatisticsRepository(db as unknown as DatabaseModels).tasks(
      user.toString(),
      statisticsPeriod({}),
    );
    expect(memberFind).toHaveBeenCalledWith({
      user,
      status: 'accept',
      deleted_at: null,
    });
    expect(listFind).toHaveBeenCalledWith({
      deleted_at: null,
      $or: [{ user }, { _id: { $in: [list] } }],
    });
    expect(aggregate).toHaveBeenCalledWith(expect.arrayContaining([
      { $match: { list: { $in: [list] }, deleted_at: null } },
    ]));
  });
  it('limits pomodoro to the authenticated user and period', async () => {
    const user = new Types.ObjectId();
    const p = statisticsPeriod({ date: '2026-10-14' });
    const find = vi.fn(() => ({
      select: () => ({ lean: () => ({ exec: async () => [] }) }),
    }));
    await new StatisticsRepository({
      pomodoro: { find },
    } as unknown as DatabaseModels).pomodoro(user.toString(), p);
    expect(find).toHaveBeenCalledWith({
      user,
      deleted_at: null,
      start: { $gte: p.start, $lt: p.end },
    });
  });
});
