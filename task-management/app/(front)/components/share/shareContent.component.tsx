// app/(front)/dashboard/work/_components/share-content.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UserPlus } from "lucide-react";

interface ShareContentProps {
  listId: string;
}

export function ShareContent({ listId }: Readonly<ShareContentProps>) {
  const [email, setEmail] = useState("");

  const hasEmail = email.trim().length > 0;

  return (
    <div className="flex justify-between flex-col px-4 flex-1">
      <div className="space-y-4">
        <Input
          className={cn("rounded-sm! p-4!")}
          placeholder="Nhập email để thêm người dùng"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {!hasEmail && (
        <div className="w-full flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <UserPlus className="size-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Chưa có ai được mời</p>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                Nhập email phía trên để mời người khác cùng xem và chỉnh sửa
                danh sách này
              </p>
            </div>
          </div>
        </div>
      )}
        {
            hasEmail??   <div className="flex gap-2 py-3 justify-end border-t">
        <Button className={cn("rounded-sm")} variant="secondary">
          Hủy
        </Button>
            <Button className={cn("rounded-sm")}>Mời tham gia</Button>
      </div>
        }
    </div>
  );
}
