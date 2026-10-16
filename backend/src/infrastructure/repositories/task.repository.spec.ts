import { describe, expect, it, vi } from 'vitest';
import { TaskRepository } from './task.repository.js';

describe('TaskRepository', () => {
  it('should be defined', () => {
    const db = { Task: {}, Member: {} } as any;
    const repo = new TaskRepository(db, {} as any);
    expect(repo).toBeDefined();
  });

  it('deletes by path', async () => {
    const session = vi.fn().mockResolvedValue({ deletedCount: 1 });
    const deleteMany = vi.fn(() => ({ session }));
    const db = { Task: { deleteMany }, Member: {} } as any;
    const repo = new TaskRepository(db, {} as any);

    const result = await repo.deleteByPath('root/path');

    expect(deleteMany).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
