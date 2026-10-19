import { Check, X, UserPlus, Trash2, Pencil } from "lucide-react";

export const INVITE_EVENT = "invite-member";
export const MEMBER_ACCEPT_EVENT = "accept-member-notification";
export const MEMBER_DENY_EVENT = "deny-member-notification";
export const LIST_DELETE = "list-delete-notification";
export const LIST_UPDATE = "list-update-notification";
export const REMOVE_MEMBER_NOTIFICATION = "remove-member-notification";
export const EXIT_MEMBER_NOTIFICATION = "exit-member-notification";
export const NAVIGABLE_EVENTS = [MEMBER_ACCEPT_EVENT, LIST_UPDATE];

export type NotificationData = Record<string, unknown> & {
  user?: { id?: string; name?: string; avatar?: string };
};

export function getActor(data: NotificationData) {
  return {
    name:
      data.user?.name ??
      (data.ownerName as string | undefined) ??
      "Một người dùng",
    avatar: data.user?.avatar,
  };
}

export const EVENT_META: Record<
  string,
  { icon: React.ElementType; badgeClass: string }
> = {
  [INVITE_EVENT]: { icon: UserPlus, badgeClass: "bg-primary" },
  [MEMBER_ACCEPT_EVENT]: { icon: Check, badgeClass: "bg-primary" },
  [MEMBER_DENY_EVENT]: { icon: X, badgeClass: "bg-destructive" },
  [LIST_UPDATE]: { icon: Pencil, badgeClass: "bg-primary" },
  [LIST_DELETE]: { icon: Trash2, badgeClass: "bg-destructive" },
  [EXIT_MEMBER_NOTIFICATION]: { icon: Trash2, badgeClass: "bg-destructive" },
  [REMOVE_MEMBER_NOTIFICATION]: { icon: Trash2, badgeClass: "bg-destructive" },
};

const Bold = ({ children }: { children: React.ReactNode }) => (
  <span className="font-bold">{children}</span>
);

export function formatMessage(
  event: string,
  data: NotificationData,
): React.ReactNode {
  const { name } = getActor(data);
  const listName = (data.listName as string | undefined) ?? "";
  const oldListName = (data.oldListName as string | undefined) ?? "";
  const removeMember =
    (data.removedMember as { email?: string } | undefined)?.email ?? "";

  switch (event) {
    case INVITE_EVENT:
      return (
        <>
          <Bold>{name}</Bold> đã mời bạn vào &quot;{listName}&quot;
        </>
      );
    case MEMBER_ACCEPT_EVENT:
      return (
        <>
          <Bold>{name}</Bold> đã chấp nhận lời mời vào &quot;{listName}&quot;
        </>
      );
    case MEMBER_DENY_EVENT:
      return (
        <>
          <Bold>{name}</Bold> đã từ chối lời mời vào &quot;{listName}&quot;
        </>
      );
    case LIST_UPDATE:
      return oldListName && oldListName !== listName ? (
        <>
          <Bold>{name}</Bold> đã đổi tên danh sách &quot;{oldListName}&quot;
          thành &quot;{listName}&quot;
        </>
      ) : (
        <>
          <Bold>{name}</Bold> đã cập nhật danh sách &quot;{listName}&quot;
        </>
      );
    case LIST_DELETE:
      return (
        <>
          <Bold>{name}</Bold> đã xóa danh sách &quot;{listName}&quot;
        </>
      );
    case REMOVE_MEMBER_NOTIFICATION:
      return (
        <>
          <Bold>{name}</Bold> đã xóa người dùng &quot;{removeMember}&quot; ra
          khỏi danh sách &quot;{listName}&quot;
        </>
      );
    case EXIT_MEMBER_NOTIFICATION:
      return (
        <>
          <Bold>{name}</Bold> đã rời khỏi danh sách &quot;{listName}&quot;
        </>
      );
    default:
      return "Bạn có thông báo mới";
  }
}