import { afterEach, describe, expect, it, vi } from 'vitest';
import { UpdateRuleUsecase } from './updateRule.usecase.js';

describe('UpdateRuleUsecase', () => {
  afterEach(() => vi.restoreAllMocks());
  function setup(shared = true) {
    const session = {};
    const tasks = { findById: vi.fn().mockResolvedValue({ id: 'task', rule: 'rule', list: 'list' }) };
    const rules = {
      update: vi.fn().mockResolvedValue({ id: 'rule' }),
      findById: vi.fn().mockResolvedValue({ id: 'rule', tags: ['Old', 'Keep'] }),
    };
    const tags = { findTagsByName: vi.fn().mockResolvedValue([{ name: 'Old' }, { name: 'New' }]) };
    const lists = {
      findById: vi.fn().mockResolvedValue({ id: 'list', shared_tags: ['Old'], isShareList: shared, members: ['member'] }),
      getCurrentTag: vi.fn().mockResolvedValue({ tags: ['Old', 'New'] }),
      update: vi.fn().mockResolvedValue({}),
      pushTagsIntoList: vi.fn().mockResolvedValue(undefined),
      pullTagsOutOfList: vi.fn().mockResolvedValue(undefined),
    };
    const members = { findManyByIds: vi.fn().mockResolvedValue([{ user: 'actor' }, { user: 'other' }, { user: null }, { user: 'other' }]) };
    const sync = { execute: vi.fn().mockResolvedValue(undefined) };
    const publisher = { pub: vi.fn().mockResolvedValue(undefined) };
    const unitWork = {
      startTransaction: vi.fn().mockResolvedValue(undefined), getSession: vi.fn().mockReturnValue(session),
      commitTransaction: vi.fn().mockResolvedValue(undefined), rollBackTransaction: vi.fn().mockResolvedValue(undefined),
    };
    const usecase = new UpdateRuleUsecase(tasks as any, rules as any, tags as any, lists as any, members as any, sync as any, publisher as any, unitWork);
    return { usecase, tasks, rules, tags, lists, sync, publisher, unitWork, session };
  }

  it('syncs only new list tags and notifies after commit', async () => {
    const { usecase, tasks, lists, sync, publisher, unitWork, session } = setup();
    publisher.pub.mockImplementation(async () => { expect(unitWork.commitTransaction).toHaveBeenCalledOnce(); });
    await usecase.execute('task', { tags: ['Old', 'New'] }, 'actor');
    expect(tasks.findById).toHaveBeenCalledTimes(1);
    expect(lists.findById).toHaveBeenCalledTimes(1);
    expect(sync.execute).toHaveBeenCalledWith({ listIds: ['list'], newTags: ['New'] }, session);
    expect(lists.pushTagsIntoList).toHaveBeenCalledWith({ listId: 'list', share_tags: ['New'], session });

  });

  it('adds existing tags without replacing current ones', async () => {
    const { usecase, rules, session } = setup();
    await usecase.execute('task', { tags: { add: ['New', 'Missing', 'new'] } }, 'actor');
    expect(rules.update).toHaveBeenCalledWith('rule', expect.objectContaining({ tags: ['Old', 'Keep', 'New'] }), session);
  });

  it('deletes tags without requiring ownership or dropping unrelated tags', async () => {
    const { usecase, rules, tags, session } = setup();
    await usecase.execute('task', { tags: { delete: ['old'] } }, 'actor');
    expect(rules.update).toHaveBeenCalledWith('rule', expect.objectContaining({ tags: ['Keep'] }), session);
    expect(tags.findTagsByName).not.toHaveBeenCalled();
  });

  it('removes the old tag and adds an existing tag without renaming any tag', async () => {
    const { usecase, rules, publisher, session } = setup();
    await usecase.execute('task', { tags: { delete: ['old'], add: ['new', 'Missing'] } }, 'actor');
    expect(rules.update).toHaveBeenCalledWith('rule', expect.objectContaining({ tags: ['Keep', 'New'] }), session);
    expect(publisher.pub).toHaveBeenCalledWith('Rule.exchange', 'Rule.update', 'direct', expect.objectContaining({ data: expect.objectContaining({ tags: ['Keep', 'New'] }) }));
  });

  it('applies delete then add in a combined request', async () => {
    const { usecase, rules, session } = setup();
    await usecase.execute('task', { tags: {
      delete: ['Old', 'Keep'], add: ['New', 'old'],
    } }, 'actor');
    expect(rules.update).toHaveBeenCalledWith('rule', expect.objectContaining({ tags: ['New', 'Old'] }), session);
  });

  it('rejects malformed operations before any write', async () => {
    const { usecase, rules } = setup();
    await expect(usecase.execute('task', { tags: { add: 'New' } } as any, 'actor')).rejects.toMatchObject({ status: 400 });
    expect(rules.update).not.toHaveBeenCalled();
  });

  it('removes and adds tags and publishes the saved list', async () => {
    const { usecase, rules, publisher, session } = setup();
    await usecase.execute('task', { tags: { delete: ['Old'], add: ['New'] } }, 'actor');
    expect(rules.update).toHaveBeenCalledWith('rule', expect.objectContaining({ tags: ['Keep', 'New'] }), session);
    expect(publisher.pub).toHaveBeenCalledWith('Rule.exchange', 'Rule.update', 'direct', expect.objectContaining({ data: expect.objectContaining({ tags: ['Keep', 'New'] }) }));
  });

  it('rejects update operations for rule tags', async () => {
    const { usecase, rules } = setup();
    await expect(usecase.execute('task', { tags: { update: [{ currentName: 'Old', newName: 'New' }] } } as any, 'actor')).rejects.toMatchObject({ status: 400 });
    expect(rules.update).not.toHaveBeenCalled();
  });

  it('ignores missing additions while removing specified tags', async () => {
    const { usecase, rules, session } = setup();
    await usecase.execute('task', { tags: { delete: ['Keep'], add: ['Old', 'Missing'] } }, 'actor');
    expect(rules.update).toHaveBeenCalledWith('rule', expect.objectContaining({ tags: ['Old'] }), session);
  });

  it('ignores missing tags in both the saved rule and notification', async () => {
    const { usecase, tags, rules, lists, unitWork, publisher, session } = setup();
    tags.findTagsByName.mockResolvedValue([{ name: 'Old' }]);
    lists.getCurrentTag.mockResolvedValue({ tags: ['Old'] });
    await expect(usecase.execute('task', { tags: ['Old', 'Missing'] }, 'actor')).resolves.toBeUndefined();
    expect(rules.update).toHaveBeenCalledWith('rule', expect.objectContaining({ tags: ['Old'] }), session);
    expect(publisher.pub).toHaveBeenCalledWith('Rule.exchange', 'Rule.update', 'direct', expect.objectContaining({ data: expect.objectContaining({ tags: ['Old'] }) }));
    expect(unitWork.rollBackTransaction).not.toHaveBeenCalled();
  });

  it('saves an empty tag set when none of the requested tags exist', async () => {
    const { usecase, tags, rules, lists, sync, session } = setup();
    tags.findTagsByName.mockResolvedValue([]);
    lists.getCurrentTag.mockResolvedValue({ tags: [] });
    await usecase.execute('task', { tags: ['Missing'] }, 'actor');
    expect(rules.update).toHaveBeenCalledWith('rule', expect.objectContaining({ tags: [] }), session);
    expect(lists.pullTagsOutOfList).toHaveBeenCalledWith({ listIds: ['list'], nameTags: ['Old'], session });
    expect(lists.pushTagsIntoList).not.toHaveBeenCalled();
    expect(sync.execute).not.toHaveBeenCalled();
  });

  it('deduplicates existing tags using their stored names without changing the input', async () => {
    const { usecase, rules, session } = setup();
    const data = { tags: ['old', 'OLD', 'Missing', 'New', ''] };
    await usecase.execute('task', data, 'actor');
    expect(rules.update).toHaveBeenCalledWith('rule', expect.objectContaining({ tags: ['Old', 'New'] }), session);
    expect(data.tags).toEqual(['old', 'OLD', 'Missing', 'New', '']);
  });

  it('allows clearing all tags and keeps tags still used by other tasks', async () => {
    const { usecase, rules, lists, tags, session, sync } = setup();
    lists.getCurrentTag.mockResolvedValue({ tags: ['Old'] });
    await usecase.execute('task', { tags: [] }, 'actor');
    expect(tags.findTagsByName).not.toHaveBeenCalled();
    expect(rules.update).toHaveBeenCalledWith('rule', expect.objectContaining({ tags: [] }), session);
    expect(lists.pullTagsOutOfList).not.toHaveBeenCalled();
    expect(lists.pushTagsIntoList).not.toHaveBeenCalled();
    expect(sync.execute).not.toHaveBeenCalled();
  });

  it('does not recalculate tags for unrelated rule changes', async () => {
    const { usecase, lists, sync, rules, session } = setup(false);
    await usecase.execute('task', { priority: 2 }, 'actor');
    expect(lists.getCurrentTag).not.toHaveBeenCalled();
    expect(sync.execute).not.toHaveBeenCalled();
    expect(rules.update).toHaveBeenCalledWith('rule', expect.objectContaining({ priority: 2 }), session);
    expect(rules.update.mock.calls[0][1]).not.toHaveProperty('repeat');
  });

  it('run reuses the caller session without committing or publishing', async () => {
    const { usecase, unitWork, publisher, rules, session } = setup();
    await usecase.run('task', { priority: 1 }, 'actor', session);
    expect(rules.update).toHaveBeenCalledWith('rule', expect.anything(), session);
    expect(unitWork.startTransaction).not.toHaveBeenCalled();
    expect(unitWork.commitTransaction).not.toHaveBeenCalled();
    expect(publisher.pub).not.toHaveBeenCalled();
  });

  it('does not roll back committed changes on notification failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { usecase, publisher, unitWork } = setup();
    publisher.pub.mockRejectedValue(new Error('offline'));
    await expect(usecase.execute('task', { priority: 1 }, 'actor')).resolves.toBeUndefined();
    expect(unitWork.commitTransaction).toHaveBeenCalledOnce();
    expect(unitWork.rollBackTransaction).not.toHaveBeenCalled();
  });
});
