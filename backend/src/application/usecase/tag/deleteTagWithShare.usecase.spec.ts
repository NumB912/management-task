import { describe, expect, it, vi, afterEach } from 'vitest';
import { DeleteTagWithShareUsecase } from './deleteTagWithShare.usecase.js';
import type { ITagRepository } from '@/domain';

describe('deleteTagWithShare.usecase', () => {
  afterEach(() => vi.restoreAllMocks());

  function setup(shared = true) {
    const session = {};
    const tags = {
      findOne: vi.fn().mockResolvedValue({ id: 'tag-1', name: 'Tag' }),
      deleteByName: vi.fn<ITagRepository['deleteByName']>().mockResolvedValue(true),
      deleteSharedTagsInLists: vi.fn().mockResolvedValue(undefined),
    };
    const lists = {
      getListByUser: vi.fn().mockResolvedValue(shared ? [{ id: 'list-1', shared_tags: ['Tag'] }] : []),
      pullTagsOutOfList: vi.fn().mockResolvedValue(undefined),
    };
    const rules = {
      getRuleInListAndTags: vi.fn().mockResolvedValue([{ rules: [{ id: 'rule-1' }] }]),
      pullTagsOutOfRule: vi.fn().mockResolvedValue(undefined),
    };
    const unitWork = {
      startTransaction: vi.fn().mockResolvedValue(undefined),
      getSession: vi.fn().mockReturnValue(session),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      rollBackTransaction: vi.fn().mockResolvedValue(undefined),
    };
    const usecase = new DeleteTagWithShareUsecase(tags as any, lists as any, rules as any, unitWork);
    return { usecase, tags, lists, rules, unitWork, session };
  }
  const dto = { id: 'tag-1', userId: 'user-1' };

  it('removes private and shared usage and related shared tag copies', async () => {
    const { usecase, lists, tags, session } = setup();
    lists.getListByUser.mockResolvedValue([
      { id: 'private', shared_tags: ['Tag'], isShareList: false },
      { id: 'shared', shared_tags: ['tag'], isShareList: true },
      { id: 'unrelated', shared_tags: ['Other'], isShareList: true },
    ]);
    await usecase.execute(dto);
    expect(tags.deleteByName).toHaveBeenCalledWith({ userId: dto.userId, name: 'Tag' }, session);
    expect(lists.pullTagsOutOfList).toHaveBeenCalledWith({ listIds: ['private', 'shared'], nameTags: ['Tag'], session });
    expect(tags.deleteSharedTagsInLists).toHaveBeenCalledWith({ name: 'Tag', listIds: ['private', 'shared'] }, session);
  });

  it('retries all reads and writes after a transient write conflict', async () => {
    const { usecase, tags, lists, rules, unitWork, session } = setup();
    rules.pullTagsOutOfRule.mockRejectedValueOnce(Object.assign(new Error('conflict'), { code: 112 }));
    await expect(usecase.execute(dto)).resolves.toBe(true);
    expect(tags.findOne).toHaveBeenCalledTimes(2);
    expect(tags.findOne).toHaveBeenCalledWith({ id: dto.id, user: dto.userId }, session);
    expect(tags.deleteByName).toHaveBeenCalledTimes(2);
    expect(lists.getListByUser).toHaveBeenCalledWith({ userId: dto.userId, session });
    expect(rules.getRuleInListAndTags).toHaveBeenCalledWith({ listIds: ['list-1'], nameTags: ['Tag'], session });
    expect(unitWork.startTransaction).toHaveBeenCalledTimes(2);
    expect(unitWork.rollBackTransaction).toHaveBeenCalledTimes(1);
    expect(unitWork.commitTransaction).toHaveBeenCalledTimes(1);
  });

  it('commits even when no lists contain the tag', async () => {
    const { usecase, unitWork, rules } = setup(false);
    await expect(usecase.execute(dto)).resolves.toBe(true);
    expect(unitWork.commitTransaction).toHaveBeenCalledTimes(1);
    expect(rules.getRuleInListAndTags).not.toHaveBeenCalled();
  });

  it('stops after three transient failures', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { usecase, tags, unitWork } = setup();
    tags.deleteByName.mockRejectedValue({ errorLabels: ['TransientTransactionError'] });
    await expect(usecase.execute(dto)).rejects.toThrow('Lỗi trong quá trình xóa thẻ chia sẻ');
    expect(unitWork.startTransaction).toHaveBeenCalledTimes(3);
    expect(unitWork.rollBackTransaction).toHaveBeenCalledTimes(3);
    expect(unitWork.commitTransaction).not.toHaveBeenCalled();
  });

  it('does not retry a non-transient failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { usecase, tags, unitWork } = setup();
    tags.deleteByName.mockRejectedValue(new Error('invalid query'));
    await expect(usecase.execute(dto)).rejects.toThrow();
    expect(unitWork.startTransaction).toHaveBeenCalledTimes(1);
    expect(unitWork.rollBackTransaction).toHaveBeenCalledTimes(1);
  });

  it('preserves the missing-tag error and rolls back', async () => {
    const { usecase, tags, unitWork } = setup();
    tags.findOne.mockResolvedValue(null);
    await expect(usecase.execute(dto)).rejects.toThrow('Không tìm thấy tag');
    expect(tags.deleteByName).not.toHaveBeenCalled();
    expect(unitWork.rollBackTransaction).toHaveBeenCalledTimes(1);
  });
});
