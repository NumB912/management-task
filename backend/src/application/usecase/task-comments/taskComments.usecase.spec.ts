import { describe, expect, it, vi } from 'vitest';
import { TaskCommentsUsecase } from './taskComments.usecase';

describe('TaskCommentsUsecase', () => {
  const userId = '507f1f77bcf86cd799439011';
  const taskId = '507f1f77bcf86cd799439012';
  const listId = '507f1f77bcf86cd799439013';
  function setup() {
    const repository = {
      findAuthor: vi
        .fn()
        .mockResolvedValue({ id: userId, name: 'Alice', blocked: false }),
      findTaskList: vi.fn().mockResolvedValue(listId),
      findListRole: vi.fn().mockResolvedValue('can edit'),
      create: vi.fn().mockResolvedValue({ id: 'comment' }),
      list: vi.fn().mockResolvedValue({ comments: [], nextCursor: null }),
      findComment: vi.fn().mockResolvedValue(null),
      replies: vi.fn().mockResolvedValue({ comments: [], nextCursor: null }),
    };
    return { repository, usecase: new TaskCommentsUsecase(repository) };
  }
  it.each(['owner', 'can edit'])(
    'allows %s to read and create comments',
    async (role) => {
      const { repository, usecase } = setup();
      repository.findListRole.mockResolvedValue(role);
      expect((await usecase.list(userId, taskId)).canComment).toBe(true);
      await usecase.create(userId, taskId, {
        body: 'Hello',
        clientRequestId: 'comment-request-001',
      });
      expect(repository.create).toHaveBeenCalledOnce();
    },
  );
  it('allows read-only members to read but rejects direct create requests', async () => {
    const { repository, usecase } = setup();
    repository.findListRole.mockResolvedValue('read only');
    expect(await usecase.list(userId, taskId)).toEqual({
      comments: [],
      nextCursor: null,
      canComment: false,
    });
    await expect(
      usecase.create(userId, taskId, {
        body: 'Hello',
        clientRequestId: 'comment-request-001',
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 });
    expect(repository.list).toHaveBeenCalledOnce();
    expect(repository.create).not.toHaveBeenCalled();
  });
  it('checks the current role again after permission is downgraded', async () => {
    const { repository, usecase } = setup();
    expect((await usecase.list(userId, taskId)).canComment).toBe(true);
    repository.findListRole.mockResolvedValue('read only');
    await expect(
      usecase.create(userId, taskId, {
        body: 'Hello',
        clientRequestId: 'comment-request-001',
      }),
    ).rejects.toMatchObject({ status: 403 });
    expect(repository.create).not.toHaveBeenCalled();
  });
  it('uses the authenticated author, ignores spoofed authors, and trims the body', async () => {
    const { repository, usecase } = setup();
    await usecase.create(userId, taskId, {
      body: ' Hello ',
      authorId: 'someone-else',
      clientRequestId: 'comment-request-001',
    });
    expect(repository.create).toHaveBeenCalledWith({
      taskId,
      authorId: userId,
      authorName: 'Alice',
      authorAvatar: null,
      parentId: null,
      replyToId: null,
      replyToName: null,
      body: 'Hello',
      clientRequestId: 'comment-request-001',
    });
  });
  it('replies to another reply at the root level and uses the server-side recipient name', async () => {
    const { repository, usecase } = setup();
    const rootId = '507f1f77bcf86cd799439014';
    const replyId = '507f1f77bcf86cd799439015';
    repository.findComment
      .mockResolvedValueOnce({
        id: replyId,
        parentId: rootId,
        authorName: 'Bob',
      })
      .mockResolvedValueOnce({ id: rootId, parentId: null });
    await usecase.create(userId, taskId, {
      body: 'Thanks',
      clientRequestId: 'comment-request-002',
      replyToId: replyId,
      parentId: replyId,
      replyToName: 'Spoofed',
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        parentId: rootId,
        replyToId: replyId,
        replyToName: 'Bob',
      }),
    );
    expect(repository.findComment).toHaveBeenNthCalledWith(1, taskId, replyId);
    expect(repository.findComment).toHaveBeenNthCalledWith(2, taskId, rootId);
  });
  it('rejects missing, cross-task and incorrectly nested reply targets', async () => {
    const { repository, usecase } = setup();
    const replyId = '507f1f77bcf86cd799439015';
    const input = {
      body: 'Hello',
      clientRequestId: 'comment-request-002',
      replyToId: replyId,
    };
    await expect(usecase.create(userId, taskId, input)).rejects.toMatchObject({
      status: 404,
    });
    repository.findComment
      .mockResolvedValueOnce({
        id: replyId,
        parentId: listId,
        authorName: 'Bob',
      })
      .mockResolvedValueOnce({ id: listId, parentId: taskId });
    await expect(usecase.create(userId, taskId, input)).rejects.toMatchObject({
      status: 400,
    });
    expect(repository.create).not.toHaveBeenCalled();
  });
  it('allows read-only users to view replies but prevents writing replies', async () => {
    const { repository, usecase } = setup();
    const rootId = '507f1f77bcf86cd799439014';
    repository.findListRole.mockResolvedValue('read only');
    repository.findComment.mockResolvedValue({ id: rootId, parentId: null });
    expect((await usecase.replies(userId, taskId, rootId)).canComment).toBe(
      false,
    );
    await expect(
      usecase.create(userId, taskId, {
        body: 'Hello',
        clientRequestId: 'comment-request-002',
        replyToId: rootId,
      }),
    ).rejects.toMatchObject({ status: 403 });
    expect(repository.create).not.toHaveBeenCalled();
  });
  it('denies revoked members and blocked accounts before reading or creating comments', async () => {
    const { repository, usecase } = setup();
    repository.findAuthor.mockResolvedValueOnce({
      id: userId,
      name: 'Alice',
      blocked: true,
    });
    await expect(usecase.list(userId, taskId)).rejects.toMatchObject({
      code: 'ACCOUNT_BLOCKED',
    });
    repository.findListRole.mockResolvedValue(null);
    await expect(
      usecase.create(userId, taskId, {
        body: 'Hello',
        clientRequestId: 'comment-request-001',
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.list).not.toHaveBeenCalled();
  });
  it('validates task IDs, cursors, body length and retry IDs', async () => {
    const { repository, usecase } = setup();
    for (const body of ['', ' ', 123, 'x'.repeat(2001)])
      await expect(
        usecase.create(userId, taskId, {
          body,
          clientRequestId: 'comment-request-001',
        }),
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    await expect(
      usecase.create(userId, taskId, { body: 'Hello' }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    await expect(usecase.list(userId, 'invalid')).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
    await expect(usecase.list(userId, taskId, 'invalid')).rejects.toMatchObject(
      { code: 'BAD_REQUEST' },
    );
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.list).not.toHaveBeenCalled();
  });
  it('denies access to deleted tasks and forwards authorized history cursors', async () => {
    const { repository, usecase } = setup();
    repository.findTaskList.mockResolvedValueOnce(null);
    await expect(usecase.list(userId, taskId)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await usecase.list(userId, taskId, listId);
    expect(repository.list).toHaveBeenCalledWith(taskId, listId);
  });
});
