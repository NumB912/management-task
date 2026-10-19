import { describe, expect, it, vi } from 'vitest';
import { TaskCommentRepository } from './taskComment.repository';
import type { DatabaseModels } from './database/clientSchema.database';
import { Types } from 'mongoose';

describe('TaskCommentRepository', () => {
  const taskId = '507f1f77bcf86cd799439011';
  const userId = '507f1f77bcf86cd799439012';
  it('paginates only comments of the selected task', async () => {
    const docs = Array.from({ length: 51 }, (_, i) => ({
      _id: new Types.ObjectId((100 - i).toString(16).padStart(24, '0')),
      task: taskId,
      author: userId,
      authorName: 'Alice',
      body: 'Comment',
      clientRequestId: 'comment-request-001',
      createdAt: new Date(),
    }));
    const query = {
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(docs),
    };
    const find = vi.fn().mockReturnValue(query);
    const repository = new TaskCommentRepository({
      TaskComment: { find, aggregate: vi.fn().mockResolvedValue([]) },
      User: {
        find: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            lean: vi
              .fn()
              .mockResolvedValue([
                { _id: userId, name: 'Alice', avatar: 'avatars/alice.png' },
              ]),
          }),
        }),
      },
    } as unknown as DatabaseModels);
    const page = await repository.list(taskId, userId);
    expect(page.comments).toHaveLength(50);
    expect(page.nextCursor).toBe('000000000000000000000033');
    expect(page.comments[0].id).toBe('000000000000000000000033');
    expect(page.comments[0].authorAvatar).toBe('avatars/alice.png');
    expect(find.mock.calls[0][0].parent).toBeNull();
    expect(String(find.mock.calls[0][0].task)).toBe(taskId);
    expect(String(find.mock.calls[0][0]._id.$lt)).toBe(userId);
  });
  it('uses a conditional insert scoped to task, author and retry ID', async () => {
    const input = {
      taskId,
      authorId: userId,
      authorName: 'Alice',
      body: 'Hello',
      clientRequestId: 'comment-request-001',
    };
    const update = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: taskId,
        task: taskId,
        author: userId,
        ...input,
        createdAt: new Date(),
      }),
    });
    const repository = new TaskCommentRepository({
      TaskComment: { findOneAndUpdate: update },
    } as unknown as DatabaseModels);
    await repository.create(input);
    expect(String(update.mock.calls[0][0].task)).toBe(taskId);
    expect(String(update.mock.calls[0][0].author)).toBe(userId);
    expect(update.mock.calls[0][0].clientRequestId).toBe(input.clientRequestId);
    expect(update.mock.calls[0][1].$setOnInsert.body).toBe('Hello');
    expect(update.mock.calls[0][2]).toEqual({
      upsert: true,
      new: true,
      runValidators: true,
    });
  });
  it('scopes reply pages to their root and task and skips avatar queries on empty pages', async () => {
    const query = {
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    };
    const find = vi.fn().mockReturnValue(query);
    const findUsers = vi.fn();
    const repository = new TaskCommentRepository({
      TaskComment: { find },
      User: { find: findUsers },
    } as unknown as DatabaseModels);
    expect(await repository.replies(taskId, userId)).toEqual({
      comments: [],
      nextCursor: null,
    });
    expect(String(find.mock.calls[0][0].task)).toBe(taskId);
    expect(String(find.mock.calls[0][0].parent)).toBe(userId);
    expect(findUsers).not.toHaveBeenCalled();
  });
  it('restricts shared list access to accepted and unexpired memberships', async () => {
    const findOne = vi.fn().mockReturnValue({
      select: vi
        .fn()
        .mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }),
    });
    const repository = new TaskCommentRepository({
      List: {
        findOne: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            lean: vi
              .fn()
              .mockResolvedValue({ user: 'owner', isShareList: true }),
          }),
        }),
      },
      Member: { findOne },
    } as unknown as DatabaseModels);
    expect(await repository.findListRole(userId, taskId)).toBeNull();
    expect(findOne).toHaveBeenCalledWith({
      user: new Types.ObjectId(userId),
      list: new Types.ObjectId(taskId),
      status: 'accept',
      deleted_at: null,
      $or: [{ expire_at: null }, { expire_at: { $gt: expect.any(Date) } }],
    });
  });
  it.each(['owner', 'can edit', 'read only', 'unknown'])(
    'returns only supported active membership roles (%s)',
    async (role) => {
      const repository = new TaskCommentRepository({
        List: {
          findOne: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              lean: vi.fn().mockResolvedValue({
                user: 'other-owner',
                isShareList: true,
              }),
            }),
          }),
        },
        Member: {
          findOne: vi.fn().mockReturnValue({
            select: vi
              .fn()
              .mockReturnValue({ lean: vi.fn().mockResolvedValue({ role }) }),
          }),
        },
      } as unknown as DatabaseModels);
      expect(await repository.findListRole(userId, taskId)).toBe(
        role === 'unknown' ? null : role,
      );
    },
  );
  it('grants the list owner permission without requiring a membership record', async () => {
    const repository = new TaskCommentRepository({
      List: {
        findOne: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue({ user: userId }),
          }),
        }),
      },
    } as unknown as DatabaseModels);
    expect(await repository.findListRole(userId, taskId)).toBe('owner');
  });
});
