// components/list/edit-list-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { listApi } from "../../feature/api/list/list.api";
import { useUpdateList } from "../../feature/hook/useListMutation.hook";

interface EditListDialogProps {
  list: { id: string; name: string } | null;
  onClose: () => void;
}

export function EditListDialog({ list, onClose }: Readonly<EditListDialogProps>) {
  const [name, setName] = useState(list?.name??"");
  const {mutate,isPending} = useUpdateList()
    if(!list){
    return
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === list?.name) return;
    mutate({
      name:trimmed,
      id:list?.id,
    },{
      onSuccess:()=>{
        onClose()
      }
    });
  };

  return (
    <Dialog open={!!list} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh sách</DialogTitle>
            <DialogDescription>
              Đổi tên danh sách của bạn. Nhấn lưu khi hoàn tất.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                maxLength={100}
                       className={cn(`rounded! px-3! py-5!`)}
              />
            </div>
          </div>

          <DialogFooter className={cn("bg-transparent! p-3! border-t-0 mt-3")}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}