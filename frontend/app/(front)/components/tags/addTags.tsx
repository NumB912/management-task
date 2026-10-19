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
import { useWorkspaceStore } from "../../feature/store/workspace.state";
import { useShallow } from "zustand/react/shallow";
import { tagApi } from "../../feature/api/tags/tag.api";
import { randomUUID } from "crypto";
import ObjectID from "bson-objectid";
import ColorPicker from "../color/colorPicker.component";
import { DEFAULT_COLORS } from "../../model/mod/color.config";

interface addTagsDialogProps {
  open:boolean;
  onClose: () => void;
}

export function AddTagDialog({ open, onClose }: Readonly<addTagsDialogProps>) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const existingNames = useWorkspaceStore(
    useShallow((s) =>
      s.tagIndex[name]
    )
  );
  const addTag = useWorkspaceStore((s)=>s.addTag)
  const remove = useWorkspaceStore((s)=>s.removetagIndex)
  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { name: string; id: string; color: string }) => {
      return await tagApi.create(data);
    },
    onSuccess: () => {
      toast.success("Đã thêm thẻ");
      setName("");
      setError(null);
    },
    onError: () => toast.error("Thêm thất bại, thử lại sau"),
  });

  const validate = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return "Tên thẻ không được để trống";
    if (existingNames) {
      return "Tên thẻ đã tồn tại";
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
    const newTagId = new ObjectID().toHexString();
    addTag({
      name:trimmed,
      id:newTagId,
      color,
    })
    mutate({
      name: trimmed,
      id: newTagId,
      color,
    },{
      onError(error, variables, onMutateResult, context) {
        remove(trimmed)
      }
    });

    onClose()
  };

  const handleClose = () => {
    setName("");
    setColor(DEFAULT_COLORS[0]);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className={cn("font-bold!")}>Thêm thẻ</DialogTitle>
            <DialogDescription>
              Tạo thẻ mới để tổ chức công việc của bạn.
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
                placeholder="Tên thẻ"
                aria-invalid={!!error}
                className={cn(`rounded! px-3! py-5! ${error && "border-destructive!"}`)}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <div className="grid gap-2">
              <span className="text-sm font-medium">Màu thẻ</span>
              <ColorPicker value={color} onChange={setColor} />
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
