import { describe, expect, it, vi } from 'vitest';
import { TagRepository } from './tag.repository.js';

describe('TagRepository', () => {
  it('deletes only shared copies belonging to members of the affected lists', async () => {
    const session = {} as any;
    const aggregateSession = vi.fn().mockResolvedValue([{ users: ['user-1', 'user-2'] }]);
    const aggregate = vi.fn().mockReturnValue({ session: aggregateSession });
    const deleteMany = vi.fn().mockResolvedValue({ deletedCount: 2 });
    const repo = new TagRepository({ List: { aggregate }, Tag: { deleteMany } } as any, {} as any);
    await repo.deleteSharedTagsInLists({ name: 'Tag', listIds: ['507f1f77bcf86cd799439011'] }, session);
    expect(aggregateSession).toHaveBeenCalledWith(session);
    expect(deleteMany).toHaveBeenCalledWith({ name: 'Tag', user: { $in: ['user-1', 'user-2'] }, isShareTag: true }, { session, collation: { locale: 'vi', strength: 2 } });
  });
  it('should be defined', () => {
    const db = { Tag: {} } as any;
    const repo = new TagRepository(db, {} as any);
    expect(repo).toBeDefined();
  });

  it('deletes by name', async () => {
    const deleteOne = vi.fn().mockResolvedValue({ deletedCount: 1 });
    const db = { Tag: { deleteOne } } as any;
    const mapper = {
      toPersistencePartial: vi.fn((d: any) => d),
      toDomain: vi.fn((d: any) => d),
    } as any;
    const repo = new TagRepository(db, mapper);

    const result = await repo.deleteByName(
      { name: 'tag', userId: '507f1f77bcf86cd799439011' },
    );

    expect(deleteOne).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
