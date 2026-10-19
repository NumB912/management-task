"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Reply, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { TaskComment } from "../../model/task-comment.model";
import { taskCommentApi } from "../../feature/api/task/task-comment.api";
import { resolveSrc } from "../../utils/readURL.utils";
import { getInitials } from "../../utils/actor.utils";

function CommentBubble({
  comment,
  userId,
  canReply,
  onReply,
  isReply = false,
}: {
  comment: TaskComment;
  userId?: string;
  canReply: boolean;
  onReply: (comment: TaskComment) => void;
  isReply?: boolean;
}) {
  const own = comment.authorId === userId;
  const avatar = comment.authorAvatar;
  const src =
    avatar && /^https?:\/\//i.test(avatar) ? avatar : resolveSrc(avatar);
  return (
    <article
      className={`flex items-start gap-2 ${own ? "flex-row-reverse" : ""}`}
      aria-label={`Bình luận của ${own ? "bạn" : comment.authorName}`}
    >
      <Avatar className={`${isReply ? "size-7" : "size-9"} shrink-0`}>
        <AvatarImage
          src={src}
          alt={`Ảnh đại diện ${comment.authorName}`}
          className="object-cover"
        />
        <AvatarFallback className="text-xs">
          {getInitials(comment.authorName)}
        </AvatarFallback>
      </Avatar>
      <div
        className={`min-w-0 flex-1 rounded-xl border p-3 ${own ? "border-primary/20 bg-primary/5" : "bg-muted/20"}`}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold">{comment.authorName}</span>
          {own && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Bạn
            </span>
          )}
          <time
            className="text-xs text-muted-foreground"
            dateTime={comment.createdAt}
          >
            {new Date(comment.createdAt).toLocaleString("vi-VN")}
          </time>
        </div>
        <p className="mt-2 text-sm whitespace-pre-wrap break-words">
          {comment.replyToName && (
            <>
              <span className="font-semibold text-primary">
                @{comment.replyToName}
              </span>{" "}
            </>
          )}
          {comment.body}
        </p>
        {canReply && (
          <button
            type="button"
            className="mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
            onClick={() => onReply(comment)}
            aria-label={`Trả lời ${comment.authorName}`}
          >
            <Reply size={13} />
            Trả lời
          </button>
        )}
      </div>
    </article>
  );
}

export function TaskCommentThread({
  comment,
  taskId,
  userId,
  canReply,
  onReply,
  open,
  onToggle,
}: {
  comment: TaskComment;
  taskId: string;
  userId?: string;
  canReply: boolean;
  onReply: (comment: TaskComment) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const query = useInfiniteQuery({
    queryKey: ["task-comment-replies", taskId, comment.id],
    queryFn: ({ pageParam, signal }) =>
      taskCommentApi.replies(taskId, comment.id, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: open,
  });
  const replies = [
    ...new Map(
      (query.data?.pages.flatMap((page) => page.comments) ?? []).map(
        (reply) => [reply.id, reply],
      ),
    ).values(),
  ].sort((a, b) => a.id.localeCompare(b.id));
  const mayReply =
    canReply && (query.data?.pages.every((page) => page.canComment) ?? true);
  return (
    <div className="space-y-2">
      <CommentBubble
        comment={comment}
        userId={userId}
        canReply={canReply}
        onReply={onReply}
      />
      {(!!comment.replyCount || open) && (
        <div className="ml-5 sm:ml-9 border-l pl-3 space-y-3">
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-medium text-primary py-1"
            onClick={onToggle}
            aria-expanded={open}
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {open ? "Ẩn trả lời" : `Xem ${comment.replyCount ?? 0} trả lời`}
          </button>
          {open && (
            <>
              {query.isPending && (
                <p role="status" className="text-xs text-muted-foreground">
                  Đang tải trả lời...
                </p>
              )}
              {query.isError && (
                <div role="alert" className="text-xs text-destructive">
                  Không thể tải trả lời.{" "}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => void query.refetch()}
                  >
                    Thử lại
                  </button>
                </div>
              )}
              {query.hasNextPage && (
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  disabled={query.isFetchingNextPage}
                  onClick={() => void query.fetchNextPage()}
                >
                  {query.isFetchingNextPage
                    ? "Đang tải..."
                    : "Xem trả lời cũ hơn"}
                </Button>
              )}
              {replies.map((reply) => (
                <CommentBubble
                  key={reply.id}
                  comment={reply}
                  userId={userId}
                  canReply={mayReply}
                  onReply={onReply}
                  isReply
                />
              ))}
              {query.isSuccess && !replies.length && (
                <p className="text-xs text-muted-foreground">
                  Chưa có trả lời.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
