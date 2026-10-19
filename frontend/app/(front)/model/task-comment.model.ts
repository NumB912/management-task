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
  canComment: boolean;
  comments: TaskComment[];
  nextCursor: string | null;
}
