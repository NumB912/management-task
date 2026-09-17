"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listApi } from "../../feature/api/list/list.api";
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
import { useDeleteList } from "../../feature/hook/useListMutation.hook";
interface DeleteListDialogProps {
  list: { id: string; name: string } | null;
  onClose: () => void;
}

export function DeleteListDialog({ list, onClose }: Readonly<DeleteListDialogProps>) {
  const {isPending,mutate} = useDeleteList()

  if(!list){
    return
  }
const handleDelete = () => {
  console.log(list.id)
  mutate(list.id, {
    onSuccess: () => {
      toast.info("Xóa thành công");
      onClose();
    },
    onError: () => {
      toast.error("Xóa thất bại, thử lại sau");
    },
  });
};

  return (
    <Dialog open={!!list} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">Xóa danh sách "{list?.name}"?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Tất cả task thuộc danh sách này
            sẽ bị xóa.
          </DialogDescription>
        </DialogHeader>

        
        <DialogFooter className={cn("bg-transparent! p-3! border-t-0 mt-3")}>
          <Button type="button" variant="outline" className="rounded-sm!" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            onClick={handleDelete}
            className="rounded-sm!"
          >
            {isPending ? "Đang xóa..." : "Xóa danh sách"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}