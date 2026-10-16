import { describe, expect, it, vi } from 'vitest';
import { FilterRepository } from './filter.repository.js';

describe('FilterRepository', () => {
  it('should be defined', () => {
    const db = { Filter: {} } as any;
    const repo = new FilterRepository(db, {} as any);
    expect(repo).toBeDefined();
  });

  it('changes tag name in filters', async () => {
    const updateMany = vi.fn().mockResolvedValue({ modifiedCount: 2 });
    const db = { Filter: { updateMany } } as any;
    const repo = new FilterRepository(db, {} as any);
    
    const result = await repo.changeNameTag({
      userId: 'u1',
      currentName: 'old',
      newName: 'new',
    });

    expect(updateMany).toHaveBeenCalled();
    expect(result).toBe(2);
  });
});
