import { afterEach, describe, expect, it, vi } from 'vitest';
import { UpdateTaskUsecase } from './updateTask.usecase.js';
import { UpdateRuleUsecase } from './updateRule.usecase.js';

describe('UpdateTaskUsecase tag operations', () => {
  afterEach(() => vi.restoreAllMocks());
  function setup() {
    let rule = { id: 'rule', tags: ['Old', 'Keep'] };
    const tasks = {
      findById: vi.fn().mockResolvedValue({ id: 'task', list: 'list', section: 'section', rule: 'rule' }),
      findByIdPopulate: vi.fn(async () => ({ id: 'task', list: 'list', section: 'section', rule })),
      update: vi.fn().mockResolvedValue({}),
    };
    const rules = {
      findById: vi.fn(async () => rule),
      update: vi.fn(async (_id, patch) => { rule = { ...rule, ...patch }; return rule; }),
    };
    const tags = { findTagsByName: vi.fn().mockResolvedValue([{ name: 'New' }]) };
    const lists = {
      findById: vi.fn().mockResolvedValue({ id: 'list', isShareList: true, shared_tags: ['Old', 'Keep'], members: ['member'] }),
      getCurrentTag: vi.fn(async () => ({ tags: rule.tags })),
      update: vi.fn().mockResolvedValue({}),
      pushTagsIntoList: vi.fn().mockResolvedValue(undefined),
      pullTagsOutOfList: vi.fn().mockResolvedValue(undefined),
    };
    const members = { findManyByIds: vi.fn().mockResolvedValue([{ user: 'other' }]) };
    const publisher = { pub: vi.fn().mockResolvedValue(undefined) };
    const unitWork = {
      startTransaction: vi.fn().mockResolvedValue(undefined), getSession: vi.fn().mockReturnValue({}),
      commitTransaction: vi.fn().mockResolvedValue(undefined), rollBackTransaction: vi.fn().mockResolvedValue(undefined),
    };
    const sync = { execute: vi.fn().mockResolvedValue(undefined) };
    const updateRule = new UpdateRuleUsecase(tasks as any, rules as any, tags as any, lists as any, members as any, sync as any, publisher as any, unitWork);
    const move = { run: vi.fn().mockResolvedValue(undefined) };
    const usecase = new UpdateTaskUsecase(tasks as any, updateRule, move as any, lists as any, members as any, publisher as any, unitWork);
    return { usecase, rules, tasks, lists, move, unitWork, publisher };
  }

  it.each([
    [{ add: ['New', 'Missing'] }, ['Old', 'Keep', 'New']],
    [{ delete: ['old'], add: ['New'] }, ['Keep', 'New']],
    [{ delete: ['Old'] }, ['Keep']],
    [{ delete: ['Old'], add: ['New', 'Missing'] }, ['Keep', 'New']],
  ])('applies %j in the task transaction without moving its section', async (operations, expected) => {
    const { usecase, rules, move, lists, unitWork, publisher } = setup();
    await usecase.execute({ id: 'task', userId: 'actor', data: { name: 'Updated', rule: { tags: operations } } });
    expect(rules.update).toHaveBeenCalledWith('rule', expect.objectContaining({ tags: expected }), expect.anything());
    if (expected.includes('New')) {
      expect(lists.pushTagsIntoList).toHaveBeenCalledWith({ listId: 'list', share_tags: ['New'], session: expect.anything() });
    } else {
      expect(lists.pushTagsIntoList).not.toHaveBeenCalled();
    }
    if (!expected.includes('Old')) {
      expect(lists.pullTagsOutOfList).toHaveBeenCalledWith({ listIds: ['list'], nameTags: ['Old'], session: expect.anything() });
    }
    expect(move.run).not.toHaveBeenCalled();
    expect(unitWork.startTransaction).toHaveBeenCalledOnce();
    expect(unitWork.commitTransaction).toHaveBeenCalledOnce();
    expect(publisher.pub).toHaveBeenCalledWith('Task.exchange', 'Task.update', 'direct', expect.objectContaining({ data: expect.objectContaining({ rule: expect.objectContaining({ tags: expected }) }) }));
  });

  it('still moves when a section is explicitly changed', async () => {
    const { usecase, move } = setup();
    await usecase.execute({ id: 'task', userId: 'actor', data: { section: 'new-section', rule: { tags: { add: ['New'] } } } });
    expect(move.run).toHaveBeenCalledWith({ taskId: 'task', listId: 'list', sectionId: 'new-section' }, expect.anything());
  });

  it('rolls back both task and tag changes on rule failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { usecase, rules, unitWork, publisher } = setup();
    rules.update.mockRejectedValue(new Error('write failed'));
    await expect(usecase.execute({ id: 'task', userId: 'actor', data: { name: 'Changed', rule: { tags: { add: ['New'] } } } })).rejects.toThrow();
    expect(unitWork.rollBackTransaction).toHaveBeenCalledOnce();
    expect(unitWork.commitTransaction).not.toHaveBeenCalled();
    expect(publisher.pub).not.toHaveBeenCalled();
  });
});
