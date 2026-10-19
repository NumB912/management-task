// components/list/edit-list-dialog.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
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
import { useWorkspaceStore } from "../../feature/store/workspace.state";
import ColorPicker from "../color/colorPicker.component";
import { useUpdateColor } from "../../feature/hook/useTaskMutation.hook";
import { DEFAULT_COLORS } from "../../model/mod/color.config";

interface EditListDialogProps {
  list: { id: string; name: string; color?: string; isShareList?: boolean } | null;
  onClose: () => void;
}

export function EditListDialog({ list, onClose }: Readonly<EditListDialogProps>) {
  const [name, setName] = useState(list?.name??"");
  const [color, setColor] = useState(list?.color ?? DEFAULT_COLORS[0]);
  const {mutate,isPending} = useUpdateList()
  const { mutate: saveColor, isPending: isColorPending } = useUpdateColor();
  const editList = useWorkspaceStore((s) => s.editList);
  const updateColorStore = useWorkspaceStore((s) => s.updateColor);
  
    useEffect(()=>{
    setName(list?.name??"")
    setColor(list?.color ?? DEFAULT_COLORS[0])
  },[list])


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!list) return
    const trimmed = name.trim();
    if (!trimmed) return;
    if (trimmed !== list.name) {
      editList(list.id,trimmed)
      mutate({
      name:trimmed,
      id:list?.id,
      });
    }
    if (color !== (list.color ?? DEFAULT_COLORS[0])) {
      updateColorStore(list.id, color, "list");
      saveColor({ id: list.id, color, type: "list" });
    }
    onClose()
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

          <div className="grid gap-2">
            <span className="text-sm font-medium">Màu danh sách</span>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          <DialogFooter className={cn("bg-transparent! p-3! border-t-0 mt-3")}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending || isColorPending || !name.trim()}>
              {isPending || isColorPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
