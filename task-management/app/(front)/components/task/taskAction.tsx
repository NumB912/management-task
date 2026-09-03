import { Button } from "@/components/ui/button";

interface TaskActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  buttonContent?:string
}

const TaskActions = ({ onCancel, onSubmit, isSubmitting,buttonContent="Tạo" }: TaskActionsProps) => (
  <div className="flex gap-2 mt-2 justify-end">
    <Button onClick={onCancel} variant={"outline"} className="px-3 py-1 text-sm border rounded-sm">
      Huỷ
    </Button>
    <Button
      onClick={onSubmit}
      disabled={isSubmitting}
      className="px-3 py-1 text-sm border rounded-sm bg-primary text-primary-foreground disabled:opacity-50"
    >
      {isSubmitting ? "Đang thao tác..." : buttonContent}
    </Button>
  </div>
);

export default TaskActions;