import { describe, expect, it, vi } from 'vitest';
import { ListRepository } from './list.repository.js';

describe('ListRepository', () => {
  it('matches an accepted membership for the requested user in the same session', async () => {
    const session = {} as any;
    const execute = vi.fn().mockResolvedValue([]);
    const aggregate = vi.fn().mockReturnValue({ session: execute });
    const repo = new ListRepository({ List: { aggregate } } as any, {} as any, {} as any);
    await expect(repo.getListByUser({ userId: '507f1f77bcf86cd799439011', session })).resolves.toEqual([]);
    const match = aggregate.mock.calls[0][0][1].$match;
    expect(match.membersData.$elemMatch.user.toString()).toBe('507f1f77bcf86cd799439011');
    expect(match.membersData.$elemMatch.status).toBe('accept');
    expect(match).not.toHaveProperty('status');
    expect(execute).toHaveBeenCalledWith(session);
  });
  it('pulls string tags from lists', async () => {
    const updateMany = vi.fn().mockResolvedValue({});
    const repo = new ListRepository({ List: { updateMany } } as any, {} as any, {} as any);
    await repo.pullTagsOutOfList({ listIds: ['507f1f77bcf86cd799439011'], nameTags: ['Tag'] });
    expect(updateMany.mock.calls[0][1]).toEqual({ $pull: { shared_tags: { $in: ['Tag'] } } });
  });
  it('should be defined', () => {
    const db = { List: {}, Member: {}, Task: {} } as any;
    const repo = new ListRepository(db, {} as any, {} as any);
    expect(repo).toBeDefined();
  });

  it('deletes by path', async () => {
    const session = vi.fn().mockResolvedValue({ deletedCount: 1 });
    const deleteMany = vi.fn(() => ({ session }));
    const db = { List: { deleteMany }, Member: {}, Task: {} } as any;
    const repo = new ListRepository(db, {} as any, {} as any);

    const result = await repo.deleteByPath('root/path');
    
    expect(deleteMany).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
