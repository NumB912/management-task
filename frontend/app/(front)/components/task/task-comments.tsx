"use client";

import { useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { MessageSquare, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { taskCommentApi } from "../../feature/api/task/task-comment.api";
import type { TaskComment } from "../../model/task-comment.model";
import useUserState from "../../feature/store/user/user.state";
import { TaskCommentThread } from "./task-comment-thread";

function errorMessage(error: unknown) {
  return axios.isAxiosError(error) &&
    typeof error.response?.data?.message === "string"
    ? error.response.data.message
    : "Không thể tải hoặc gửi bình luận. Vui lòng thử lại.";
}

export function TaskComments({ taskId }: { taskId: string }) {
  const [draft, setDraft] = useState("");
  const userId = useUserState((state) => state.user?.id);
  const [replyTarget, setReplyTarget] = useState<TaskComment | null>(null);
  const [openThreads, setOpenThreads] = useState<Set<string>>(new Set());
  const textarea = useRef<HTMLTextAreaElement>(null);
  const pending = useRef<{
    body: string;
    clientRequestId: string;
    replyToId?: string;
  } | null>(null);
  const client = useQueryClient();
  const key = ["task-comments", taskId];
  const query = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam, signal }) =>
      taskCommentApi.list(taskId, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  const mutation = useMutation({
    mutationFn: ({ body, replyToId }: { body: string; replyToId?: string }) => {
      const input =
        pending.current?.body === body &&
        pending.current?.replyToId === replyToId
          ? pending.current
          : {
              body,
              clientRequestId: crypto.randomUUID(),
              ...(replyToId ? { replyToId } : {}),
            };
      pending.current = input;
      return taskCommentApi.create(taskId, input);
    },
    onSuccess: async () => {
      setDraft("");
      setReplyTarget(null);
      pending.current = null;
      await Promise.all([
        client.invalidateQueries({ queryKey: key }),
        client.invalidateQueries({
          queryKey: ["task-comment-replies", taskId],
        }),
      ]);
    },
    onError: async (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        await client.invalidateQueries({ queryKey: key });
      }
    },
  });
  const canComment =
    query.isSuccess && query.data.pages.every((page) => page.canComment);
  const comments = [
    ...new Map(
      (query.data?.pages.flatMap((page) => page.comments) ?? []).map(
        (comment) => [comment.id, comment],
      ),
    ).values(),
  ].sort((a, b) => a.id.localeCompare(b.id));
  return (
    <section
      className="border-t pt-4 space-y-4"
      aria-labelledby="task-comments-heading"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="task-comments-heading"
          className="flex items-center gap-2 font-semibold"
        >
          <MessageSquare size={18} />
          Bình luận
        </h2>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw size={14} />
          Làm mới
        </Button>
      </div>
      {query.isPending && (
        <p role="status" className="text-sm text-muted-foreground">
          Đang tải bình luận...
        </p>
      )}
      {query.isError && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage(query.error)}
        </p>
      )}
      {query.hasNextPage && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
        >
          {query.isFetchingNextPage ? "Đang tải..." : "Xem bình luận cũ hơn"}
        </Button>
      )}
      {query.isSuccess && !comments.length && (
        <p className="text-sm text-muted-foreground">
          Chưa có bình luận cho task này.
        </p>
      )}
      <div className="space-y-3">
        {comments.map((comment) => (
          <TaskCommentThread
            key={comment.id}
            comment={comment}
            taskId={taskId}
            userId={userId}
            canReply={canComment && !mutation.isPending}
            open={openThreads.has(comment.id)}
            onToggle={() =>
              setOpenThreads((current) => {
                const next = new Set(current);
                if (next.has(comment.id)) next.delete(comment.id);
                else next.add(comment.id);
                return next;
              })
            }
            onReply={(target) => {
              setReplyTarget(target);
              setOpenThreads((current) =>
                new Set(current).add(target.parentId ?? target.id),
              );
              textarea.current?.focus();
            }}
          />
        ))}
      </div>
      {query.isSuccess && !canComment && (
        <p className="text-sm text-muted-foreground">
          Bạn có quyền chỉ đọc. Chỉ người có quyền thao tác mới có thể gửi bình
          luận.
        </p>
      )}
      {canComment && (
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (draft.trim() && !mutation.isPending && canComment)
              mutation.mutate({
                body: draft.trim(),
                ...(replyTarget ? { replyToId: replyTarget.id } : {}),
              });
          }}
        >
          {replyTarget && (
            <div className="flex items-center justify-between gap-2 rounded-md bg-primary/5 p-2 text-sm">
              <span>
                Đang trả lời <strong>@{replyTarget.authorName}</strong>
              </span>
              <button
                type="button"
                aria-label="Hủy trả lời"
                disabled={mutation.isPending}
                onClick={() => setReplyTarget(null)}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <textarea
            ref={textarea}
            aria-label="Nội dung bình luận"
            rows={3}
            maxLength={2000}
            placeholder={
              replyTarget
                ? `Trả lời @${replyTarget.authorName}...`
                : "Viết bình luận về task..."
            }
            className="w-full rounded-md border bg-background p-3 text-sm resize-y"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={mutation.isPending}
          />
          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage(mutation.error)}
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {draft.length}/2.000 ký tự
            </span>
            <Button
              type="submit"
              disabled={!canComment || mutation.isPending || !draft.trim()}
            >
              {mutation.isPending
                ? "Đang gửi..."
                : replyTarget
                  ? "Gửi trả lời"
                  : "Gửi bình luận"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
