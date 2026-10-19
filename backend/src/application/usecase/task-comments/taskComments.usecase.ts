import { AppError } from '@/domain/errors/appError.errors.js';
import type { ITaskCommentRepository } from '@/domain/repositories/ITaskComment.repository.js';

export class TaskCommentsUsecase {
  constructor(private readonly repository: ITaskCommentRepository) {}
  private async authorize(userId: string, taskId: string) {
    if (!/^[a-f\d]{24}$/i.test(userId))
      throw new AppError('UNAUTHORIZED', 'Vui lòng đăng nhập', 401);
    if (!/^[a-f\d]{24}$/i.test(taskId))
      throw new AppError('BAD_REQUEST', 'Task không hợp lệ', 400);
    const author = await this.repository.findAuthor(userId);
    if (!author)
      throw new AppError('UNAUTHORIZED', 'Tài khoản không tồn tại', 401);
    if (author.blocked)
      throw new AppError('ACCOUNT_BLOCKED', 'Tài khoản đã bị khóa', 403);
    const listId = await this.repository.findTaskList(taskId);
    const role = listId
      ? await this.repository.findListRole(userId, listId)
      : null;
    if (!role)
      throw new AppError(
        'FORBIDDEN',
        'Bạn không có quyền xem hoặc bình luận task này',
        403,
      );
    return { author, canComment: role === 'owner' || role === 'can edit' };
  }
  async list(userId: string, taskId: string, before?: string) {
    const { canComment } = await this.authorize(userId, taskId);
    if (before !== undefined && !/^[a-f\d]{24}$/i.test(before))
      throw new AppError('BAD_REQUEST', 'Mốc bình luận không hợp lệ', 400);
    return { ...(await this.repository.list(taskId, before)), canComment };
  }
  async create(userId: string, taskId: string, input: unknown) {
    const { author, canComment } = await this.authorize(userId, taskId);
    if (!canComment)
      throw new AppError(
        'FORBIDDEN',
        'Bạn chỉ có quyền đọc bình luận. Cần quyền thao tác để gửi bình luận.',
        403,
      );
    if (!input || typeof input !== 'object' || Array.isArray(input))
      throw new AppError('BAD_REQUEST', 'Nội dung không hợp lệ', 400);
    const { body, clientRequestId, replyToId } = input as Record<
      string,
      unknown
    >;
    if (typeof body !== 'string' || !body.trim() || body.trim().length > 2000)
      throw new AppError(
        'BAD_REQUEST',
        'Bình luận phải từ 1 đến 2.000 ký tự',
        400,
      );
    if (
      typeof clientRequestId !== 'string' ||
      !/^[a-z\d-]{16,64}$/i.test(clientRequestId)
    )
      throw new AppError('BAD_REQUEST', 'Mã bình luận không hợp lệ', 400);
    let parentId: string | null = null;
    let replyToName: string | null = null;
    let targetId: string | null = null;
    if (replyToId !== undefined && replyToId !== null) {
      if (typeof replyToId !== 'string' || !/^[a-f\d]{24}$/i.test(replyToId))
        throw new AppError(
          'BAD_REQUEST',
          'Bình luận được trả lời không hợp lệ',
          400,
        );
      const target = await this.repository.findComment(taskId, replyToId);
      if (!target)
        throw new AppError(
          'NOT_FOUND',
          'Không tìm thấy bình luận được trả lời trong task này',
          404,
        );
      if (target.parentId) {
        const root = await this.repository.findComment(taskId, target.parentId);
        if (!root || root.parentId)
          throw new AppError(
            'BAD_REQUEST',
            'Luồng bình luận không hợp lệ',
            400,
          );
      }
      parentId = target.parentId ?? target.id;
      targetId = target.id;
      replyToName = target.authorName;
    }
    return this.repository.create({
      taskId,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar ?? null,
      parentId,
      replyToId: targetId,
      replyToName,
      body: body.trim(),
      clientRequestId,
    });
  }
  async replies(
    userId: string,
    taskId: string,
    parentId: string,
    before?: string,
  ) {
    const { canComment } = await this.authorize(userId, taskId);
    if (
      !/^[a-f\d]{24}$/i.test(parentId) ||
      (before !== undefined && !/^[a-f\d]{24}$/i.test(before))
    )
      throw new AppError('BAD_REQUEST', 'Mốc bình luận không hợp lệ', 400);
    const root = await this.repository.findComment(taskId, parentId);
    if (!root || root.parentId)
      throw new AppError('NOT_FOUND', 'Không tìm thấy bình luận gốc', 404);
    return {
      ...(await this.repository.replies(taskId, parentId, before)),
      canComment,
    };
  }
}
