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
import { useWorkspaceStore } from "../../states/workspace.state";
import { useShallow } from "zustand/react/shallow";
import { useCreateList } from "../../feature/hook/useListMutation.hook";

interface AddListDialogProps {
  open:boolean;
  onClose: () => void;
}

export function AddListDialog({ open, onClose }: Readonly<AddListDialogProps>) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const existingNames = useWorkspaceStore(
    useShallow((s) =>
      Object.values(s.listInfo).map((item) =>
        item.list.name.trim().toLowerCase()
      )
    )
  );

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  const { mutate, isPending } = useCreateList()
  
  const validate = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return "Tên danh sách không được để trống";
    if (existingNames.includes(trimmed.toLowerCase())) {
      return "Tên danh sách đã tồn tại";
    }
    return null;
  };


  const handleChange = (value: string) => {
    setName(value);
    setError(validate(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    mutate({
      name:trimmed
    },{
      onSuccess: () => {
      toast.success("Đã thêm danh sách");
      setName("");
      setError(null);
      onClose();
    },
    onError: () => toast.error("Thêm thất bại, thử lại sau"),
    });
  };

  const handleClose = () => {
    setName("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className={cn("font-bold!")}>Thêm danh sách</DialogTitle>
            <DialogDescription>
              Tạo danh sách mới để tổ chức công việc của bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            <div className="grid gap-2">
             <Input
                id="name"
                value={name}
                onChange={(e) => handleChange(e.target.value)}
                autoFocus
                maxLength={100}
                placeholder="Tên danh sách"
                aria-invalid={!!error}
                className={cn(`rounded! px-3! py-5! ${error && "border-destructive!"}`)}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>

          <DialogFooter className={cn("bg-transparent! p-3! border-t-0 mt-3")}>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending || !name.trim() || !!error}>
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}