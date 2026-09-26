"use client";

import { useEffect, useState } from "react";
import useNotifications from "../../feature/hook/useNotification.hook";
import { formatDate } from "../../utils/getDayOfMonth.utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "../ui/separator";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useUserState from "../../states/user/user.state";

interface NotificationBellProps {
  apiUrl: string;
}
const INVITE_EVENT = "invite-member";

function formatMessage(event: string, data: Record<string, unknown>): string {
  switch (event) {
    case INVITE_EVENT:
      return `${data.ownerName ?? "Một người dùng"} đã mời bạn vào "${data.listName ?? ""}"`;
    default:
      return "Bạn có thông báo mới";
  }
}

export default function NotificationBell({ apiUrl }: NotificationBellProps) {
  const {
    notification,
    filterUnReadNotification,
    connect,
    unreadCount,
    updateRead,
    clearUnreadCount,
    handleRespond,
    open,
    setOpen,
  } = useNotifications(apiUrl);
  const [valueToggle, setValueToggle] = useState<"unread" | "all">("all");
  const { user } = useUserState();

  const filteredNotification =
    valueToggle === "unread" ? filterUnReadNotification : notification;

  useEffect(() => {
    if (!open) return;
    updateRead(undefined,{
      onSuccess(data, variables, onMutateResult, context) {
        
      },
      onError(error, variables, onMutateResult, context) {
        
      },
    })
    clearUnreadCount();
  }, [open]);




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
              {filterUnReadNotification.length > 9 ? "9+" : filterUnReadNotification.length}
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
              const inviteData = n.data
                ? (n.data as {
                    id: string;
                    listId: string;
                    status: "deny" | "accept" | "pending";
                  })
                : undefined;

              return (
                <div key={n.id}>
                  <div className="flex gap-3 px-4 py-3">
                    <Avatar>
                      <AvatarImage />
                      <AvatarFallback>{user?.name?.slice(0, 2) ?? "?"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">
                        {formatMessage(n.event, n.data)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {n.created_at && formatDate(n.created_at)}
                      </p>

                      {isInvite && inviteData && (
                        <div className="w-full flex justify-end items-center gap-2 mt-2">
                          {n.data.status === "pending" ? (
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
                              {n.data.status === "accept" ? "Đã chấp nhận" : "Đã từ chối"}
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