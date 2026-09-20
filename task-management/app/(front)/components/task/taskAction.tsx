import { Button } from "@/components/ui/button";

interface TaskActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  buttonContent?:string
}

const TaskActions = ({ onCancel, onSubmit,buttonContent="Tạo" }: TaskActionsProps) => (
  <div className="flex gap-2 mt-2 justify-end">
    <Button onClick={onCancel} variant={"outline"} className="px-3 py-1 text-sm border rounded-sm">
      Huỷ
    </Button>
    <Button
      onClick={onSubmit}
      className="px-3 py-1 text-sm border rounded-sm bg-primary text-primary-foreground disabled:opacity-50"
    >
      { buttonContent}
    </Button>
  </div>
);

export default TaskActions;