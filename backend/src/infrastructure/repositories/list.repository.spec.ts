import { describe, expect, it, vi } from 'vitest';
import { ListRepository } from './list.repository.js';

describe('ListRepository', () => {
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
