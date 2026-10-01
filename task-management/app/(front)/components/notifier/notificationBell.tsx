"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useNotifications from "../../feature/hook/useNotification.hook";
import { formatDate } from "../../utils/getDayOfMonth.utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Bell, Check, X, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "../ui/separator";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { INotificationModel } from "../../model/notification.model";

interface NotificationBellProps {
  apiUrl: string;
}

const INVITE_EVENT = "invite-member";
const MEMBER_ACCEPT_EVENT = "accept-member-notification";
const MEMBER_DENY_EVENT = "deny-member-notification";

type NotificationData = Record<string, unknown> & {
  user?: { id?: string; name?: string; avatar?: string };
};

// Chỉ dùng màu theo theme của dự án
const EVENT_META: Record<
  string,
  { icon: React.ElementType; badgeClass: string }
> = {
  [INVITE_EVENT]: { icon: UserPlus, badgeClass: "bg-primary" },
  [MEMBER_ACCEPT_EVENT]: { icon: Check, badgeClass: "bg-primary" },
  [MEMBER_DENY_EVENT]: { icon: X, badgeClass: "bg-destructive" },
};

function getActor(data: NotificationData) {
  return {
    name:
      data.user?.name ??
      (data.ownerName as string | undefined) ??
      "Một người dùng",
    avatar: data.user?.avatar,
  };
}

function getInitials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "?";
}

function formatMessage(event: string, data: NotificationData): string {
  const { name } = getActor(data);
  const listName = (data.listName as string | undefined) ?? "";

  switch (event) {
    case INVITE_EVENT:
      return `${name} đã mời bạn vào "${listName}"`;
    case MEMBER_ACCEPT_EVENT:
      return `${name} đã chấp nhận lời mời vào "${listName}"`;
    case MEMBER_DENY_EVENT:
      return `${name} đã từ chối lời mời vào "${listName}"`;
    default:
      return "Bạn có thông báo mới";
  }
}

export default function NotificationBell({ apiUrl }: NotificationBellProps) {
  const {
    notification,
    filterUnReadNotification,
    connect,
    updateRead,
    clearUnreadCount,
    handleRespond,
    setNotification,
    open,
    setOpen,
  } = useNotifications(apiUrl);
  const router = useRouter();
  const [valueToggle, setValueToggle] = useState<"unread" | "all">("all");

  const filteredNotification =
    valueToggle === "unread" ? filterUnReadNotification : notification;

  useEffect(() => {
    if (!open) return;
    const hasUnread = notification.some((n) => !n.is_read);
    if (!hasUnread) return;
    const snapshot = notification;
    updateRead(undefined, {
      onError() {
        setNotification(snapshot);
      },
    });
    clearUnreadCount();

    return () => {
      setNotification((prev) =>
        prev.map((value: INotificationModel) => ({ ...value, is_read: true }))
      );
    };
  }, [open]);

  const handleItemClick = (n: INotificationModel) => {
    if (n.event !== MEMBER_ACCEPT_EVENT) return;
    const listId = (n.data as { listId?: string })?.listId;
    if (!listId) return;
    setOpen(false);
    router.push(`/dashboard/work/lists/${listId}`);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="p-5! relative rounded-full hover:bg-white"
        >
          <Bell
            className="h-6! w-6!"
            fill="white"
            color="white"
            strokeWidth={1.8}
          />
          {filterUnReadNotification.length > 0 && (
            <Badge className="absolute bg-destructive -right-0.5 -top-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] text-white">
              {filterUnReadNotification.length > 9
                ? "9+"
                : filterUnReadNotification.length}
            </Badge>
          )}
          {!connect && (
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background bg-muted-foreground/40" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="right"
        sideOffset={25}
        className="w-80 p-0"
      >
        <div className="flex items-center justify-center px-4 py-3">
          <ToggleGroup
            type="single"
            value={valueToggle}
            onValueChange={(v) => v && setValueToggle(v as "unread" | "all")}
            className="bg-accent/75 p-1 gap-1 flex justify-center w-full rounded-full"
          >
            <ToggleGroupItem
              value="all"
              className="flex-1 rounded-full data-[state=on]:bg-white font-bold"
            >
              Tất cả
            </ToggleGroupItem>
            <ToggleGroupItem
              value="unread"
              className="flex-1 rounded-full data-[state=on]:bg-white font-bold"
            >
              Chưa đọc {`(${filterUnReadNotification.length})`}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Separator />

        <div className="h-96 overflow-y-auto">
          {filteredNotification.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {valueToggle === "unread"
                ? "Không có thông báo chưa đọc"
                : "Chưa có thông báo nào"}
            </div>
          ) : (
            filteredNotification.map((n) => {
              const isInvite = n.event === INVITE_EVENT;
              const isAccept = n.event === MEMBER_ACCEPT_EVENT;
              const inviteData = n.data
                ? (n.data as {
                    id: string;
                    listId: string;
                    status: "deny" | "accept" | "pending";
                  })
                : undefined;

              const actor = getActor(n.data ?? {});
              const meta = EVENT_META[n.event];
              const Icon = meta?.icon;

              return (
                <div key={n.id}>
                  <div
                    className={`flex gap-3 px-4 py-3 ${
                      isAccept ? "cursor-pointer hover:bg-accent/40" : ""
                    }`}
                    onClick={() => handleItemClick(n)}
                  >
                    <div className="relative shrink-0">
                      <Avatar>
                        <AvatarImage src={actor.avatar} />
                        <AvatarFallback>
                          {getInitials(actor.name)}
                        </AvatarFallback>
                      </Avatar>
                      {Icon && (
                        <span
                          className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-background ${meta.badgeClass}`}
                        >
                          <Icon
                            className="h-3 w-3 text-white"
                            strokeWidth={2.5}
                          />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">
                        {formatMessage(n.event, n.data)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {n.created_at && formatDate(n.created_at)}
                      </p>

                      {isInvite && inviteData && (
                        <div className="w-full flex justify-end items-center gap-2 mt-2">
                          {inviteData.status === "pending" ? (
                            <>
                              <Button
                                onClick={() =>
                                  handleRespond({
                                    notificationId: n.id,
                                    status: "deny",
                                    listId: inviteData.listId,
                                  })
                                }
                                className="px-3 rounded-full border"
                                variant="outline"
                              >
                                Không
                              </Button>
                              <Button
                                onClick={() =>
                                  handleRespond({
                                    notificationId: n.id,
                                    status: "accept",
                                    listId: inviteData.listId,
                                  })
                                }
                                className="rounded-full px-3"
                              >
                                Đồng ý
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {inviteData.status === "accept"
                                ? "Đã chấp nhận"
                                : "Đã từ chối"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}