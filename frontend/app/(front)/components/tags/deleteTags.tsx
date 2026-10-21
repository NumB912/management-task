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
import { useWorkspaceStore } from "../../feature/store/workspace.state";
import { useTagInSharedList } from "../../feature/hook/useTagInSharedList.hook";

interface DeleteTagDialogProps {
  tag: ITagModel | null;
  onClose: () => void;
}

export function DeleteTagDialog({ tag, onClose }: Readonly<DeleteTagDialogProps>) {
  const [isShareDeleteTag, setIsShareDeleteTag] = useState<boolean>(false);
  const { mutate: removeOnlyMe, isPending: isPendingOnlyMe } = useRemoveTagOnlyMe();
  const { mutate: removeWithShare, isPending: isPendingShare } = useRemoveTagWithShare();
  const removeTag = useWorkspaceStore((state) => state.removetagIndex);
  const isPending = isPendingOnlyMe || isPendingShare;
  const isTagInSharedList = useTagInSharedList(tag?.name);

  const handleRemoveTag = () => {
    if (!tag) return;
    if (isTagInSharedList && isShareDeleteTag) {
      removeWithShare(tag.id,{
        onSuccess() {
          removeTag(tag.name, true);
        },
      });
    } else {
      removeOnlyMe(tag.id,{
        onSuccess() {
          removeTag(tag.name, false);
        },
      });
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
            {isTagInSharedList && isShareDeleteTag
              ? "Xóa thẻ khỏi các danh sách, nhiệm vụ và thẻ chia sẻ liên quan."
              : "Xóa thẻ cá nhân. Thẻ trong danh sách chia sẻ được giữ nguyên."}
          </DialogDescription>
        </DialogHeader>

        {isTagInSharedList && (
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
