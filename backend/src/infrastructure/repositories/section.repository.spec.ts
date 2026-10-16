import { describe, expect, it, vi } from 'vitest';
import { SectionRepository } from './section.repository.js';

describe('SectionRepository', () => {
  it('should be defined', () => {
    const db = { Section: {} } as any;
    const repo = new SectionRepository(db, {} as any);
    expect(repo).toBeDefined();
  });

  it('deletes by path', async () => {
    const session = vi.fn().mockResolvedValue({ deletedCount: 1 });
    const deleteMany = vi.fn(() => ({ session }));
    const db = { Section: { deleteMany } } as any;
    const repo = new SectionRepository(db, {} as any);

    const result = await repo.deleteByPath('root/path');

    expect(deleteMany).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
