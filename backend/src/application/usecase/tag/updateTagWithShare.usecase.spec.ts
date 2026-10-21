import { describe, expect, it, vi } from 'vitest';
import { UpdateTagUsecase } from './updateTagWithShare.usecase.js';

describe('UpdateTagUsecase', () => {
  function setup() {
    const session = {};
    const tags = {
      findOne: vi.fn().mockResolvedValue({ id: 'tag-1', name: 'Old' }),
      findTagByName: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({ id: 'tag-1', name: 'New' }),
    };
    const lists = {
      getListByTagNameAndUserId: vi.fn().mockResolvedValue([
        { id: 'private-list', isShareList: false },
        { id: 'shared-list', isShareList: true },
      ]),
      updateListShareTag: vi.fn().mockResolvedValue(undefined),
    };
    const rules = {
      getRuleInListAndTags: vi.fn().mockResolvedValue([
        { rules: [{ id: 'direct-rule' }, { id: 'section-rule' }, { id: 'child-rule' }] },
      ]),
      updateRuleTag: vi.fn().mockResolvedValue(undefined),
    };
    const sync = { execute: vi.fn().mockResolvedValue(undefined) };
    const unitWork = {
      startTransaction: vi.fn().mockResolvedValue(undefined), getSession: vi.fn().mockReturnValue(session),
      commitTransaction: vi.fn().mockResolvedValue(undefined), rollBackTransaction: vi.fn().mockResolvedValue(undefined),
    };
    const usecase = new UpdateTagUsecase(tags as any, lists as any, rules as any, sync as any, unitWork);
    return { usecase, tags, lists, rules, sync, unitWork, session };
  }

  it('renames across private and shared lists and synchronizes the new name', async () => {
    const { usecase, tags, lists, rules, sync, unitWork, session } = setup();
    await expect(usecase.execute({ id: 'tag-1', userId: 'user-1', name: 'New', color: '#fff' })).resolves.toBe(true);
    expect(lists.updateListShareTag).toHaveBeenCalledWith({ listIds: ['private-list', 'shared-list'], currentName: 'Old', newName: 'New', session });
    expect(rules.updateRuleTag).toHaveBeenCalledWith({ ruleIds: ['direct-rule', 'section-rule', 'child-rule'], currentName: 'Old', newName: 'New', session });
    expect(tags.update).toHaveBeenCalledWith('tag-1', { name: 'New', color: '#fff' }, session);
    expect(sync.execute).toHaveBeenCalledWith({ listIds: ['private-list', 'shared-list'], newTags: ['New'] }, session);
    expect(unitWork.commitTransaction).toHaveBeenCalledOnce();
  });

  it('allows changing only the letter case of the same tag', async () => {
    const { usecase, tags } = setup();
    tags.findTagByName.mockResolvedValue({ id: 'tag-1', name: 'Old' });
    await expect(usecase.execute({ id: 'tag-1', userId: 'user-1', name: 'OLD' })).resolves.toBe(true);
  });
});
