import { toast } from "sonner";
import { ITaskModel } from "../../model";
import { IUpdateTaskDTO } from "../../model/DTO/task.DTO";
import { useUpdateTask } from "./useTaskMutation.hook";

const ALL_ACTIVE_TAG_REGEX = /#([^\s#]+)/g;

interface UseUpdateTaskSubmitProps {
  taskId: string;
  listId: string;
  confirmList: string;
  inputRef: React.RefObject<HTMLDivElement>;
  value: string | null;
  confirmedSection: string | undefined;
  confirmedRule: Pick<
    ITaskModel["rule"],
    "end_date" | "start_date" | "repeat" | "timer" | "tags" | "priority"
  >;
  onUpdateTask: (id: string, task: Partial<ITaskModel>) => void;
  onSubmitSuccess: () => void;
}

export const useUpdateTaskSubmit = ({
  taskId,
  listId,
  confirmList,
  value,
  confirmedRule,
  inputRef,
  confirmedSection,
  onUpdateTask,
  onSubmitSuccess,
}: UseUpdateTaskSubmitProps) => {
  const { mutate, isPending } = useUpdateTask(listId);
  const getCleanTaskName = (root: HTMLElement): string => {
    const clone = root.cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll(".tag-chip, .priority-chip, .list-chip")
      .forEach((chip) => chip.remove());
    return (clone.innerText ?? "").trim();
  };

  const buildTask = (): Partial<IUpdateTaskDTO> | null => {
    if (!value) return null;
    const el = inputRef.current;
    if (!el) return null;

    const inlineTags = Array.from(value.matchAll(ALL_ACTIVE_TAG_REGEX)).map(
      (m) => m[1],
    );
    const allTags = Array.from(new Set([...confirmedRule.tags, ...inlineTags]));

    const cleanName = getCleanTaskName(el);
    if (cleanName.length === 0) return null;

    return {
      name: cleanName,
      rule: {
        tags: allTags,
        priority: confirmedRule.priority,
        repeat: confirmedRule.repeat,
        end_date: confirmedRule.end_date,
        start_date: confirmedRule.start_date,
        timer: confirmedRule.timer,
      },
      section: confirmedSection,
      list: confirmList,
      children: [],
    };
  };

  const handleDone = () => {
    const trim = value?.trim();
    if (!trim || !value) return;
    const task = buildTask();
    if (!task) {
      toast.error("Tên task không hợp lệ.");
      return;
    }

    const onError = (error: unknown) => {
      toast.error(getErrorMessage(error));
    };
    console.log(confirmedRule);
    const onSuccess = () => {
      onSubmitSuccess();
      onUpdateTask(taskId, task as Partial<ITaskModel>);
    };
    mutate(
      {
        data: task,
        taskId: taskId,
      },
      { onError, onSuccess },
    );
  };

  return { handleDone, isSubmitting: isPending };
};

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosErr = error as { response?: { data?: { message?: string } } };
    return (
      axiosErr.response?.data?.message ?? "Đã có lỗi xảy ra, vui lòng thử lại."
    );
  }
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra, vui lòng thử lại.";
};
