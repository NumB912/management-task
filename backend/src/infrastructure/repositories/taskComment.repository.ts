import { Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import type {
  ITaskCommentRepository,
  TaskComment,
} from '@/domain/repositories/ITaskComment.repository.js';
import { TYPES } from '../types/dependency.type.js';
import { DatabaseModels } from './database/clientSchema.database.js';
import type { TaskCommentRecord } from './database/schema/taskComment.schema.js';

@Injectable()
export class TaskCommentRepository implements ITaskCommentRepository {
  constructor(
    @Inject(TYPES.DatabaseType) private readonly db: DatabaseModels,
  ) {}
  async findAuthor(id: string) {
    const user = await this.db.User.findOne({
      _id: new Types.ObjectId(id),
      deleted_at: null,
    })
      .select('_id name avatar blocked')
      .lean();
    return user
      ? {
          id: String(user._id),
          name: user.name,
          avatar: user.avatar ?? null,
          blocked: user.blocked ?? false,
        }
      : null;
  }
  async findTaskList(taskId: string) {
    const task = await this.db.Task.findOne({ _id: taskId, deleted_at: null })
      .select('list')
      .lean();
    return task ? String(task.list) : null;
  }
  async findListRole(
    userId: string,
    listId: string,
  ): Promise<'owner' | 'can edit' | 'read only' | null> {
    const list = await this.db.List.findOne({ _id: listId, deleted_at: null })
      .select('user isShareList')
      .lean();
    if (!list) return null;
    if (String(list.user) === userId) return 'owner';
    if (!list.isShareList) return null;
    const member = await this.db.Member.findOne({
      user: new Types.ObjectId(userId),
      list: new Types.ObjectId(listId),
      deleted_at: null,
      status: 'accept',
      $or: [{ expire_at: null }, { expire_at: { $gt: new Date() } }],
    })
      .select('role')
      .lean();
    const role = member?.role;
    return role === 'owner' || role === 'can edit' || role === 'read only'
      ? role
      : null;
  }
  private map(doc: TaskCommentRecord & { _id: Types.ObjectId }): TaskComment {
    return {
      id: String(doc._id),
      taskId: String(doc.task),
      authorId: String(doc.author),
      authorName: doc.authorName,
      authorAvatar: doc.authorAvatar ?? null,
      parentId: doc.parent ? String(doc.parent) : null,
      replyToId: doc.replyTo ? String(doc.replyTo) : null,
      replyToName: doc.replyToName ?? null,
      body: doc.body,
      clientRequestId: doc.clientRequestId,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  
  async create(input: Omit<TaskComment, 'id' | 'createdAt'>) {
    const filter = {
      task: new Types.ObjectId(input.taskId),
      author: new Types.ObjectId(input.authorId),
      clientRequestId: input.clientRequestId,
    };
    try {
      const doc = await this.db.TaskComment.findOneAndUpdate(
        filter,
        {
          $setOnInsert: {
            ...filter,
            authorName: input.authorName,
            authorAvatar: input.authorAvatar ?? null,
            parent: input.parentId ? new Types.ObjectId(input.parentId) : null,
            replyTo: input.replyToId
              ? new Types.ObjectId(input.replyToId)
              : null,
            replyToName: input.replyToName ?? null,
            body: input.body,
            createdAt: new Date(),
          },
        },
        { upsert: true, new: true, runValidators: true },
      ).lean();
      return this.map(doc!);
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) throw error;
      const doc = await this.db.TaskComment.findOne(filter).lean();
      if (!doc) throw error;
      return this.map(doc);
    }
  }
  async findComment(taskId: string, commentId: string) {
    const doc = await this.db.TaskComment.findOne({
      _id: new Types.ObjectId(commentId),
      task: new Types.ObjectId(taskId),
    }).lean();
    if (!doc) return null;
    return (await this.decorate([doc]))[0];
  }
  private async decorate(
    docs: (TaskCommentRecord & { _id: Types.ObjectId })[],
  ) {
    if (!docs.length) return [];
    const users = await this.db.User.find({
      _id: {
        $in: [...new Set(docs.map((doc) => String(doc.author)))].map(
          (id) => new Types.ObjectId(id),
        ),
      },
      deleted_at: null,
    })
      .select('_id name avatar')
      .lean();
    const authors = new Map(users.map((user) => [String(user._id), user]));
    return docs.map((doc) => {
      const author = authors.get(String(doc.author));
      return {
        ...this.map(doc),
        authorName: author?.name ?? doc.authorName,
        authorAvatar: author
          ? (author.avatar ?? null)
          : (doc.authorAvatar ?? null),
      };
    });
  }
  async list(taskId: string, before?: string) {
    const page = await this.page(taskId, null, before);
    if (!page.comments.length) return page;
    const counts = await this.db.TaskComment.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([
      {
        $match: {
          task: new Types.ObjectId(taskId),
          parent: {
            $in: page.comments.map((comment) => new Types.ObjectId(comment.id)),
          },
        },
      },
      { $group: { _id: '$parent', count: { $sum: 1 } } },
    ]);
    const byParent = new Map(counts.map((row) => [String(row._id), row.count]));
    return {
      ...page,
      comments: page.comments.map((comment) => ({
        ...comment,
        replyCount: byParent.get(comment.id) ?? 0,
      })),
    };
  }
  async replies(taskId: string, parentId: string, before?: string) {
    return this.page(taskId, parentId, before);
  }
  private async page(taskId: string, parentId: string | null, before?: string) {
    const docs = await this.db.TaskComment.find({
      task: new Types.ObjectId(taskId),
      parent: parentId ? new Types.ObjectId(parentId) : null,
      ...(before ? { _id: { $lt: new Types.ObjectId(before) } } : {}),
    })
      .sort({ _id: -1 })
      .limit(51)
      .lean();
    const page = docs.slice(0, 50).reverse();
    return {
      comments: await this.decorate(page),
      nextCursor: docs.length > 50 ? String(page[0]._id) : null,
    };
  }
}
