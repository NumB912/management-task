"use client";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ITagModel } from "../../model";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "../ui/label";
import { useRemoveTagOnlyMe, useRemoveTagWithShare } from "../../feature/hook/useTagMutation.hook";

interface DeleteTagDialogProps {
  tag: ITagModel | null;
  onClose: () => void;
}

export function DeleteTagDialog({ tag, onClose }: Readonly<DeleteTagDialogProps>) {
  const [isShareDeleteTag, setIsShareDeleteTag] = useState<boolean>(false);
  const { mutate: removeOnlyMe, isPending: isPendingOnlyMe } = useRemoveTagOnlyMe();
  const { mutate: removeWithShare, isPending: isPendingShare } = useRemoveTagWithShare();

  const isPending = isPendingOnlyMe || isPendingShare;

  const handleRemoveTag = () => {
    if (!tag) return;
    if (isShareDeleteTag) {
      removeWithShare(tag.id);
    } else {
      removeOnlyMe(tag.id);
    }

    onClose()

  };

  if (!tag) return null;

  return (
    <Dialog open={!!tag} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">Xóa thẻ &quot;{tag.name}&quot;?</DialogTitle>
          <DialogDescription>
            Thẻ sẽ xóa ra khỏi toàn bộ nhiệm vụ mà bạn đã gắn vào
          </DialogDescription>
        </DialogHeader>

        {tag.isShareTag && (
          <div className="flex gap-2 py-2 items-center">
            <Checkbox
              id="delete-with-share"
              checked={isShareDeleteTag}
              onCheckedChange={(checked) => setIsShareDeleteTag(checked === true)}
            />
            <Label htmlFor="delete-with-share">
              <span className="font-medium">Xóa luôn cả chia sẻ</span>
            </Label>
          </div>
        )}

        <DialogFooter className={cn("bg-transparent! p-3! border-t-0 mt-3")}>
          <Button type="button" variant="outline" className="rounded-sm!" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            onClick={handleRemoveTag}
            className="rounded-sm!"
          >
            {isPending ? "Đang xóa..." : "Xóa thẻ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}