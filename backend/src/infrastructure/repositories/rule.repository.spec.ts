import { describe, expect, it, vi } from 'vitest';
import { RuleRepository } from './rule.repository.js';

describe('RuleRepository', () => {
  it('finds every tagged rule by list, independently of sections', async () => {
    const aggregate = vi.fn().mockResolvedValue([{
      _id: 'list-1', rulesData: [{ id: 'direct' }, { id: 'section' }, { id: 'child' }],
    }]);
    const mapper = { toDomain: vi.fn((rule) => rule) };
    const repo = new RuleRepository({ Rule: { aggregate } } as any, mapper as any);
    const session = {} as any;
    const result = await repo.getRuleInListAndTags({
      listIds: ['507f1f77bcf86cd799439011'], nameTags: ['Old'], session,
    });
    expect(result[0].rules.map((rule) => rule.id)).toEqual(['direct', 'section', 'child']);
    const [pipeline, options] = aggregate.mock.calls[0];
    expect(pipeline[0].$match.list.$in[0].toString()).toBe('507f1f77bcf86cd799439011');
    expect(pipeline[0].$match.tags).toEqual({ $in: ['Old'] });
    expect(pipeline.some((stage: any) => stage.$lookup)).toBe(false);
    expect(options.session).toBe(session);
  });

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
