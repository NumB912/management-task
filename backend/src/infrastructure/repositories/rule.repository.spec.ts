import { describe, expect, it, vi } from 'vitest';
import { RuleRepository } from './rule.repository.js';

describe('RuleRepository', () => {
  it('should be defined', () => {
    const db = { Rule: {} } as any;
    const repo = new RuleRepository(db, {} as any);
    expect(repo).toBeDefined();
  });

  it('pulls tags out of rules', async () => {
    const updateMany = vi.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
    const db = { Rule: { updateMany }, List: {} } as any;
    const repo = new RuleRepository(db, {} as any);

    const result = await repo.pullTagsOutOfRule({
      nameTags: ['tag'],
      ruleIds: ['507f1f77bcf86cd799439011'],
    });

    expect(updateMany).toHaveBeenCalled();
    expect(result.modifiedCount).toBe(1);
  });
});
