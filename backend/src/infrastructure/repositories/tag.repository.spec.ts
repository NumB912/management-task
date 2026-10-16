import { describe, expect, it, vi } from 'vitest';
import { TagRepository } from './tag.repository.js';

describe('TagRepository', () => {
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
