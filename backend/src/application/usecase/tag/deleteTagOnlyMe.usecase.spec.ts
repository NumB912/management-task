import { describe, expect, it, vi } from 'vitest';
import { DeleteTagOnlyMeUsecase } from './deleteTagOnlyMe.usecase.js';

describe('DeleteTagOnlyMeUsecase', () => {
  function setup(shared: boolean) {
    const session = {};
    const tags = {
      findOne: vi.fn().mockResolvedValue({ id: 'tag-1', name: 'Tag' }),
      deleteByName: vi.fn().mockResolvedValue(true),
      update: vi.fn().mockResolvedValue({}),
    };
    const lists = {
      getListByUser: vi.fn().mockResolvedValue([
        { id: 'private', shared_tags: ['Tag'], isShareList: false },
        ...(shared ? [{ id: 'shared', shared_tags: ['tag'], isShareList: true }] : []),
      ]),
      pullTagsOutOfList: vi.fn().mockResolvedValue(undefined),
    };
    const rules = {
      getRuleInListAndTags: vi.fn().mockResolvedValue([{ rules: [{ id: 'private-rule' }] }]),
      pullTagsOutOfRule: vi.fn().mockResolvedValue(undefined),
    };
    const unitWork = {
      startTransaction: vi.fn().mockResolvedValue(undefined), getSession: vi.fn().mockReturnValue(session),
      commitTransaction: vi.fn().mockResolvedValue(undefined), rollBackTransaction: vi.fn().mockResolvedValue(undefined),
    };
    return { tags, lists, rules, session, unitWork, usecase: new DeleteTagOnlyMeUsecase(tags as any, lists as any, rules as any, unitWork) };
  }
  it('removes only private usage and keeps the shared tag', async () => {
    const { usecase, tags, lists, rules, session, unitWork } = setup(true);
    await expect(usecase.execute({ id: 'tag-1', userId: 'user-1' })).resolves.toBe(true);
    expect(lists.pullTagsOutOfList).toHaveBeenCalledWith({ listIds: ['private'], nameTags: ['Tag'], session });
    expect(rules.getRuleInListAndTags).toHaveBeenCalledWith({ listIds: ['private'], nameTags: ['Tag'], session });
    expect(tags.deleteByName).not.toHaveBeenCalled();
    expect(tags.update).toHaveBeenCalledWith('tag-1', { isShareTag: true }, session);
    expect(unitWork.commitTransaction).toHaveBeenCalledOnce();
  });
  it('deletes the personal tag when no shared usage remains', async () => {
    const { usecase, tags, session } = setup(false);
    await usecase.execute({ id: 'tag-1', userId: 'user-1' });
    expect(tags.deleteByName).toHaveBeenCalledWith({ name: 'Tag', userId: 'user-1' }, session);
    expect(tags.update).not.toHaveBeenCalled();
  });
});
