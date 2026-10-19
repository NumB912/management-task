import { useMemo } from "react";
import { toast } from "sonner";
import { useNotificationStore } from "../../store/notification/notification.store";
import { useReadNotification } from "../useNotificationMutate.hook";
import { useAcceptOrDenyInvite } from "../useMemberMutation.hook";
import { ApiError } from "@/app/(front)/lib/axios";


export default function useNotifications() {
  const notifications = useNotificationStore((s) => s.notifications);
  const connect = useNotificationStore((s) => s.connect);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const setAcceptedListId = useNotificationStore((s) => s.setAcceptedListId);

  const { mutate: acceptOrDeny } = useAcceptOrDenyInvite();
  const { mutate: updateRead } = useReadNotification();

  const filterUnReadnotifications = useMemo(
    () => notifications.filter((n) => !n.is_read),
    [notifications],
  );

  const handleRespond = ({
    notificationId,
    status,
    listId,
  }: {
    status: "accept" | "deny";
    listId?: string;
    notificationId: string;
  }) => {
    if (!listId) {
      console.warn("[useNotifications] Thiếu listId, không thể xử lý");
      return;
    }
    const previous = useNotificationStore.getState().notifications;

    setNotifications((prev) =>
      prev.map((v) =>
        v.id === notificationId ? { ...v, data: { ...v.data, status } } : v,
      ),
    );

    acceptOrDeny(
      { listId, status },
      {
        onSuccess() {
          if (status === "accept") setAcceptedListId(listId);
        },
        onError(error: Error) {
          setNotifications(previous);
          if (!(error instanceof ApiError)) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
            return;
          }
          switch (error.code) {
            case "NOT_FOUND":
              toast.error("Lời mời hoặc danh sách này không còn tồn tại");
              break;
            case "FORBIDDEN":
              toast.error("Bạn không có quyền với lời mời này");
              break;
            case "TIME_OUT":
              toast.error("Lời mời đã hết hạn");
              break;
            case "BAD_REQUEST":
              toast.error(error.message);
              break;
            default:
              toast.error("Có lỗi xảy ra, vui lòng thử lại");
          }
        },
      },
    );
  };

  return {
    notifications,
    filterUnReadnotifications,
    unreadCount: filterUnReadnotifications.length,
    connect,
    setNotifications,
    markAllRead,
    updateRead,
    acceptOrDeny,
    handleRespond,
  };
}