"use client";

import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
import { ITagModel } from "../../model";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "../ui/label";
import ColorPicker from "../color/colorPicker.component";
import { DEFAULT_COLORS } from "../../model/mod/color.config";
import { useWorkspaceStore } from "../../feature/store/workspace.state";
import { useTagInSharedList } from "../../feature/hook/useTagInSharedList.hook";
import {
  useUpdateTagOnlyMe,
  useUpdateTagWithShare,
} from "../../feature/hook/useTagMutation.hook";
interface EditTagDialogProps {
  tag: ITagModel | null;
  onClose: () => void;
}

export function EditTagDialog({ tag, onClose }: Readonly<EditTagDialogProps>) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [isEditShareTag, setIsEditShareTag] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const { hasTag } = useWorkspaceStore();
  const [error, setError] = useState<string>("");
  const { mutate: updateOnlyMe, isPending: isPendingOnlyMe } =
    useUpdateTagOnlyMe();
  const { mutate: updateWithShare, isPending: isPendingShare } =
    useUpdateTagWithShare();
  const editTagWithShare = useWorkspaceStore((state) => state.editTagWithShare);
  const editTagOnlyMe = useWorkspaceStore((state) => state.editTagWithOnly);
  const isPending = isPendingOnlyMe || isPendingShare;
  const isTagInSharedList = useTagInSharedList(tag?.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag) return;
    const trimmed = name.trim();

    if (!trimmed) {
      handleCloseAll();
      return;
    }

    const nameChanged = trimmed !== tag.name;
    const colorChanged = color !== (tag.color ?? DEFAULT_COLORS[0]);
    if (!nameChanged && !colorChanged) {
      handleCloseAll();
      return;
    }

    if (nameChanged && hasTag(trimmed)) {
      setError("Trùng tên với thẻ khác rồi vui lòng dùng tên khác");
      return;
    }

    if (isTagInSharedList && !confirm) {
      setOpenEdit(false);
      setConfirm(true);
      return;
    }

    if (isTagInSharedList && isEditShareTag) {
      editTagWithShare(tag.name, {
        ...(nameChanged ? { name: trimmed } : {}), color,
      });
      updateWithShare({
        id: tag.id,
        ...(nameChanged ? { name: trimmed } : {}), color,
      });

      onClose();
    } else {
      editTagOnlyMe(tag.name, {
        ...(nameChanged ? { name: trimmed } : {}), color,
      });
      updateOnlyMe({
        id: tag.id,
        ...(nameChanged ? { name: trimmed } : {}), color,
      });
      onClose();
    }
    setOpenEdit(false);
    setConfirm(false);
  };

  useEffect(() => {
    if (tag) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(tag.name);
      setColor(tag.color ?? DEFAULT_COLORS[0]);

      setIsEditShareTag(false);
      setConfirm(false);
      setOpenEdit(true);
    } else {
      setOpenEdit(false);
      setConfirm(false);
    }
  }, [tag]);

  const handleCloseAll = () => {
    setOpenEdit(false);
    setConfirm(false);
    onClose();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) setError("");
  };
  if (!tag) return null;
  return (
    <>
      <Dialog open={openEdit} onOpenChange={(v) => !v && handleCloseAll()}>
        <DialogContent className="sm:max-w-106.25">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className={cn("font-bold!")}>
                Chỉnh sửa thẻ
              </DialogTitle>
              <DialogDescription>
                Đổi tên thẻ của bạn. Nhấn lưu khi hoàn tất.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  autoFocus
                  maxLength={100}
                  placeholder="Tên thẻ"
                  className={cn(
                    "rounded! px-3! py-5!",
                    error &&
                      "border-destructive! focus-visible:ring-destructive!",
                  )}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <div className="grid gap-2">
                <Label>Màu thẻ</Label>
                <ColorPicker value={color} onChange={setColor} />
              </div>
            </div>

            <DialogFooter
              className={cn("bg-transparent! p-3! border-t-0 mt-3")}
            >
              <Button
                type="button"
                variant="outline"
                className="rounded-sm!"
                onClick={handleCloseAll}
              >
                Hủy bỏ
              </Button>
              <Button type="submit" className="rounded-sm!">
                Chỉnh sửa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirm} onOpenChange={(v) => !v && setConfirm(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg">Xác nhận cập nhật</DialogTitle>
            <DialogDescription>
              <span>
                Chọn phạm vi áp dụng thay đổi cho danh sách &quot;{tag?.name}
                &quot;.
              </span>
              <div className="font-medium mt-5">
                {tag?.name} Đổi thành {name}
              </div>
            </DialogDescription>
          </DialogHeader>

          {isTagInSharedList && (
            <div className="flex gap-2 py-2 items-center">
              <Checkbox
                id="edit-with-share"
                checked={isEditShareTag}
                onCheckedChange={(checked) => setIsEditShareTag(!!checked)}
              />
              <Label htmlFor="edit-with-share">
                <span className="font-medium">
                  Áp dụng thay đổi cho cả người được chia sẻ
                </span>
              </Label>
            </div>
          )}

          <DialogFooter className={cn("bg-transparent! p-3! border-t-0 mt-3")}>
            <Button
              type="button"
              variant="outline"
              className="rounded-sm!"
              onClick={() => {
                setConfirm(false);
                setOpenEdit(true);
              }}
            >
              Quay lại
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isPending} className="rounded-sm!">
              {isPending ? "Đang cập nhật..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
