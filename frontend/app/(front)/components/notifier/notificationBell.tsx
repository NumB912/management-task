"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore } from "../../feature/store/notification/notification.store";
import { useShallow } from "zustand/react/shallow";

export default function NotificationBell() {
  const router = useRouter();
  const unread = useNotificationStore(useShallow((s)=>s.notifications.filter((notification)=>!notification.is_read).length))
  const connect = useNotificationStore((s) => s.connect);
  return (  
    <Button
      variant="ghost"
      size="icon"
      className="p-5! relative rounded-full hover:bg-white"
      onClick={() => router.push("/dashboard/notification")}
    >
      <Bell
        className="h-6! w-6!"
        fill="white"
        color="white"
        strokeWidth={1.8}
      />
      {unread > 0 && (
        <Badge className="absolute bg-destructive -right-0.5 -top-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] text-white">
          {unread > 9 ? "9+" : unread}
        </Badge>
      )}
      {!connect && (
        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background bg-muted-foreground/40" />
      )}
    </Button>
  );
}