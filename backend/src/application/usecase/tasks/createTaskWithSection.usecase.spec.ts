import { afterEach, describe, expect, it, vi } from 'vitest';
import { CreateTaskWithSection } from './createTaskWithSection.usecase.js';

describe('CreateTaskWithSection', () => {
  afterEach(() => vi.restoreAllMocks());
  const dto = {
    listId: 'list-1', sectionId: 'section-1', userId: 'user-1',
    data: { id: 'task-1', name: 'Task', color: '#fff', rule: { id: 'rule-1', tags: ['Old', 'New', 'Other'] } },
  };
  function setup(shared = false) {
    const session = {};
    const savedTask = { id: 'task-1', list: 'list-1', rule: 'rule-1' };
    const tasks = { create: vi.fn().mockResolvedValue(savedTask), update: vi.fn().mockResolvedValue(savedTask) };
    const sections = {
      findById: vi.fn().mockResolvedValue({ id: 'section-1', list: 'list-1', path: 'root' }),
      pushTaskIntoSection: vi.fn().mockResolvedValue(undefined),
    };
    const tags = { isUserHaveTag: vi.fn().mockResolvedValue([{ name: 'Old' }, { name: 'New' }]) };
    const lists = {
      findById: vi.fn().mockResolvedValue({ id: 'list-1', sections: ['section-1'], shared_tags: ['Old'], isShareList: shared, members: ['member-1'] }),
      pushTagsIntoList: vi.fn().mockResolvedValue(undefined),
    };
    const members = { findManyByIds: vi.fn().mockResolvedValue([{ user: 'user-1' }, { user: 'user-2' }, { user: 'user-2' }, { user: null }]) };
    const createRule = { execute: vi.fn().mockResolvedValue({ rule: { id: 'rule-1' } }) };
    const addTags = { execute: vi.fn().mockResolvedValue(undefined) };
    const publisher = { pub: vi.fn().mockResolvedValue(undefined) };
    const unitWork = {
      startTransaction: vi.fn().mockResolvedValue(undefined), getSession: vi.fn().mockReturnValue(session),
      commitTransaction: vi.fn().mockResolvedValue(undefined), rollBackTransaction: vi.fn().mockResolvedValue(undefined),
    };
    const usecase = new CreateTaskWithSection(tasks as any, sections as any, tags as any, lists as any, members as any, createRule as any, addTags as any, publisher as any, unitWork);
    return { usecase, tasks, sections, lists, createRule, addTags, publisher, unitWork, session, savedTask };
  }

  it('keeps owned tags and adds only tags missing from the list', async () => {
    const { usecase, lists, createRule, publisher, unitWork, session, savedTask } = setup();
    await expect(usecase.execute(dto as any)).resolves.toEqual(savedTask);
    expect(lists.findById).toHaveBeenCalledTimes(1);
    expect(lists.findById).toHaveBeenCalledWith('list-1', session);
    expect(lists.pushTagsIntoList).toHaveBeenCalledWith({ listId: 'list-1', share_tags: ['New'], session });
    expect(createRule.execute).toHaveBeenCalledWith(expect.objectContaining({ rule: expect.objectContaining({ tags: ['New', 'Old'] }), session }));
    expect(unitWork.commitTransaction).toHaveBeenCalledOnce();
    expect(publisher.pub).not.toHaveBeenCalled();
  });

  it('rejects a section from another list before creating a task', async () => {
    const { usecase, sections, tasks, unitWork } = setup();
    sections.findById.mockResolvedValue({ id: 'section-1', list: 'other-list', path: 'root' });
    await expect(usecase.execute(dto as any)).rejects.toMatchObject({ status: 404 });
    expect(tasks.create).not.toHaveBeenCalled();
    expect(unitWork.rollBackTransaction).toHaveBeenCalledOnce();
  });

  it('rolls back on write failure and never publishes', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { usecase, tasks, unitWork, publisher } = setup(true);
    tasks.update.mockResolvedValue(null);
    await expect(usecase.execute(dto as any)).rejects.toMatchObject({ status: 500 });
    expect(unitWork.rollBackTransaction).toHaveBeenCalledOnce();
    expect(unitWork.commitTransaction).not.toHaveBeenCalled();
    expect(publisher.pub).not.toHaveBeenCalled();
  });

  it('publishes after commit and returns the saved task even if publishing fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { usecase, publisher, unitWork, savedTask } = setup(true);
    publisher.pub.mockImplementation(async () => {
      expect(unitWork.commitTransaction).toHaveBeenCalledOnce();
      throw new Error('broker unavailable');
    });
    await expect(usecase.execute(dto as any)).resolves.toEqual(savedTask);
    expect(publisher.pub).toHaveBeenCalledWith('Task.exchange', 'Task.create', 'direct', expect.objectContaining({ userIds: ['user-2'] }));
    expect(unitWork.rollBackTransaction).not.toHaveBeenCalled();
  });
});
