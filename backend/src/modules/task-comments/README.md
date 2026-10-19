# Task comments

Task comments use REST and are displayed below the task description. No chat
gateway or Socket.IO dependency is required. Notification SSE is independent.

`TaskCommentsModule` registers the HTTP controller, application use case and
MongoDB repository. Domain contracts are in `ITaskComment.repository.ts`.

- `GET /api/v1/tasks/:taskId/comments?before=<commentId>` returns
  `{ comments, nextCursor, canComment }`, at most 50 root comments in chronological
  order, including current author avatars and reply counts.
- `GET /api/v1/tasks/:taskId/comments/:commentId/replies?before=<replyId>` returns
  a separately paginated reply page with the same permission checks.
- `POST /api/v1/tasks/:taskId/comments` accepts
  `{ body, clientRequestId, replyToId? }` and returns the saved comment. The author is derived
  from the authenticated session. The browser generates a stable retry ID to
  avoid duplicate comments after network failures.

Replies have one child level only. The server resolves `replyToId` within the
same task, computes the root parent and stores the recipient's name. Replying
to a reply attaches to that root instead of creating another nesting level.
The UI prefixes replies with `@recipient`, shows a reply target in the composer,
and identifies the signed-in author's comments with a **Bạn** badge. Existing
comments without a parent remain roots; no data migration is required.

The task and its list must exist and not be deleted. Only the list owner or an
accepted, unexpired member can read comments. Only the owner and members with
`can edit` permission may post comments. Read-only members can view the history
but the UI hides the composer. The API rechecks the role on every write and
denies direct POST requests from read-only members with HTTP 403. Blocked accounts
are denied by middleware and use case.

Comments are stored in `task_comments`, separately from task descriptions. The
unique index on task/author/clientRequestId must be created when automatic
MongoDB index creation is disabled. Comments are plain text, limited to 2,000
characters, and escaped by React. Existing chat collections are not deleted.
