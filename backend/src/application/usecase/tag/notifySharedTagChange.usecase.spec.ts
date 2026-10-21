import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotifySharedTagChangeUsecase } from './notifySharedTagChange.usecase';
import { TagsController } from '@/modules/tags/http/tags.controller';

describe('shared tag notifications', () => {
  afterEach(() => vi.restoreAllMocks());
  function setup() {
    const tags = { findOne: vi.fn().mockResolvedValue({ id: 'tag', name: 'Old' }) };
    const lists = { getListByTagNameAndUserId: vi.fn().mockResolvedValue([
      { isShareList: true, members: ['accepted', 'pending'] },
      { isShareList: false, members: ['private-member'] },
    ]) };
    const members = { findManyByIds: vi.fn().mockResolvedValue([
      { user: 'actor', status: 'accept' }, { user: 'member', status: 'accept' },
      { user: 'member', status: 'accept' }, { user: 'pending', status: 'pending' },
    ]) };
    const publisher = { pub: vi.fn().mockResolvedValue(undefined) };
    const notify = new NotifySharedTagChangeUsecase(tags as any, lists as any, members as any, publisher as any);
    const create = { execute: vi.fn().mockResolvedValue({}) };
    const updateOnly = { execute: vi.fn().mockResolvedValue(true) };
    const deleteOnly = { execute: vi.fn().mockResolvedValue(true) };
    const updateShare = { execute: vi.fn().mockResolvedValue(true) };
    const deleteShare = { execute: vi.fn().mockResolvedValue(true) };
    const controller = new TagsController(notify, create as any, updateOnly as any, deleteOnly as any, updateShare as any, deleteShare as any);
    return { notify, tags, lists, members, publisher, controller, updateShare, deleteShare };
  }
  it.each(['update', 'delete'] as const)('publishes shared %s after success to actor and accepted members', async (operation) => {
    const { notify, publisher, lists, members } = setup();
    await expect(notify.execute({ userId: 'actor', tagId: 'tag', operation }, async () => {
      expect(lists.getListByTagNameAndUserId).toHaveBeenCalledWith({ userId: 'actor', tagName: ['Old'] });
      expect(publisher.pub).not.toHaveBeenCalled();
      return true;
    })).resolves.toBe(true);
    expect(members.findManyByIds).toHaveBeenCalledWith(['accepted', 'pending']);
    expect(publisher.pub).toHaveBeenCalledWith('Tag.exchange', `Tag.${operation}.withShare`, 'direct', {
      userIds: ['actor', 'member'], event: `tag-${operation}-with-share`, data: { operation },
    });
  });
  it('does not publish on mutation failure', async () => {
    const { notify, publisher } = setup();
    await expect(notify.execute({ userId: 'actor', tagId: 'tag', operation: 'delete' }, async () => { throw new Error('rollback'); })).rejects.toThrow('rollback');
    expect(publisher.pub).not.toHaveBeenCalled();
  });
  it('does not fail a saved mutation if the broker is unavailable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { notify, publisher } = setup();
    publisher.pub.mockRejectedValue(new Error('offline'));
    await expect(notify.execute({ userId: 'actor', tagId: 'tag', operation: 'update' }, async () => 'saved')).resolves.toBe('saved');
  });
  it('does not notify for create or onlyMe endpoints', async () => {
    const { controller, publisher, tags } = setup();
    const req = { user: { id: 'actor' } } as any;
    await controller.create(req, { id: 'tag', name: 'New' });
    await controller.updateOnlyMe(req, 'tag', { name: 'New' });
    await controller.deleteOnlyMe(req, 'tag');
    expect(publisher.pub).not.toHaveBeenCalled();
    expect(tags.findOne).not.toHaveBeenCalled();
  });
  it('notifies from both withShare controller endpoints', async () => {
    const { controller, publisher } = setup();
    const req = { user: { id: 'actor' } } as any;
    await controller.updateWithShare(req, 'tag', { name: 'New' });
    await controller.deleteWithShare(req, 'tag');
    expect(publisher.pub.mock.calls.map((call) => call[1])).toEqual(['Tag.update.withShare', 'Tag.delete.withShare']);
  });
});
