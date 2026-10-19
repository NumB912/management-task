export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  parentId?: string | null;
  replyToId?: string | null;
  replyToName?: string | null;
  replyCount?: number;
  body: string;
  clientRequestId: string;
  createdAt: string;
}
export interface TaskCommentPage {
  comments: TaskComment[];
  nextCursor: string | null;
}
export interface ITaskCommentRepository {
  findAuthor(
    id: string,
  ): Promise<{
    id: string;
    name: string;
    avatar?: string | null;
    blocked: boolean;
  } | null>;
  findComment(taskId: string, commentId: string): Promise<TaskComment | null>;
  findTaskList(taskId: string): Promise<string | null>;
  findListRole(
    userId: string,
    listId: string,
  ): Promise<'owner' | 'can edit' | 'read only' | null>;
  create(input: Omit<TaskComment, 'id' | 'createdAt'>): Promise<TaskComment>;
  list(taskId: string, before?: string): Promise<TaskCommentPage>;
  replies(
    taskId: string,
    parentId: string,
    before?: string,
  ): Promise<TaskCommentPage>;
}
