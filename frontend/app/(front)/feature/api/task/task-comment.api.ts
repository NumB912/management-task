import { axiosInstance } from "../../../lib/axios";
import type {
  TaskComment,
  TaskCommentPage,
} from "../../../model/task-comment.model";

export const taskCommentApi = {
  async replies(
    taskId: string,
    commentId: string,
    before?: string,
    signal?: AbortSignal,
  ): Promise<TaskCommentPage> {
    return (
      await axiosInstance.get<TaskCommentPage>(
        `/tasks/${taskId}/comments/${commentId}/replies`,
        { params: { before }, signal },
      )
    ).data;
  },
  async list(
    taskId: string,
    before?: string,
    signal?: AbortSignal,
  ): Promise<TaskCommentPage> {
    return (
      await axiosInstance.get<TaskCommentPage>(`/tasks/${taskId}/comments`, {
        params: { before },
        signal,
      })
    ).data;
  },
  async create(
    taskId: string,
    input: { body: string; clientRequestId: string; replyToId?: string },
  ): Promise<TaskComment> {
    return (
      await axiosInstance.post<TaskComment>(`/tasks/${taskId}/comments`, input)
    ).data;
  },
};
