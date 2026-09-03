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
import { IFilterModel } from "../../model/filter.model";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { filterApi } from "../../feature/api/filters/filter.api";
import { workSpaceKeys } from "../../feature/hook/useWorkSpaceQuery.hook";
import { toast } from "sonner"; // Hoặc thư viện toast bạn đang dùng

interface DeleteFilterDialogProps {
  filter: IFilterModel | null;
  onClose: () => void;
}

export function DeleteFilterDialog({ filter, onClose }: Readonly<DeleteFilterDialogProps>) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => filterApi.delete(id),
    onSuccess: () => {
      toast.success("Xóa bộ lọc thành công");
      queryClient.invalidateQueries({ queryKey: workSpaceKeys.index() });
      onClose();
    },
    onError: () => {
      toast.error("Không thể xóa bộ lọc. Vui lòng thử lại sau!");
    },
  });

  const handleRemoveFilter = () => {
    if (!filter?.id) return;
    mutate(filter.id);
  };

  if (!filter) return null;

  return (
    <Dialog open={!!filter} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">
            Xóa bộ lọc &quot;{filter.name}&quot;?
          </DialogTitle>
          <DialogDescription>
            Bộ lọc này sẽ bị xóa khỏi toàn bộ các nhiệm vụ mà bạn đã gắn vào.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className={cn("bg-transparent! p-3! border-t-0 mt-3")}>
          <Button
            type="button"
            variant="outline"
            className="rounded-sm!"
            onClick={onClose}
            disabled={isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={handleRemoveFilter}
            className="rounded-sm!"
          >
            {isPending ? "Đang xóa..." : "Xóa bộ lọc"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}