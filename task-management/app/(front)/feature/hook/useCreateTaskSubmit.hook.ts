import { toast } from "sonner"; // đổi lại nếu bạn dùng lib toast khác
import { ITaskModel } from "../../model";
import { ICreateTaskDTO } from "../../model/DTO/task.DTO";
import { useCreateTask, useCreateTaskWithSection } from "./useTaskMutation.hook";

const ACTIVE_TAG_REGEX = /#([^\s]*)$/;
const ACTIVE_priority = /P([1-4])\s$/;
const ALL_ACTIVE_TAG_REGEX = /#([^\s#]+)/g;
const ACTIVE_LIST_REGEX = /@([^\s]*)/;


interface UseCreateTaskSubmitProps {
  listId: string;
  sectionId: string;
  confirmList: string;
  inputRef: React.RefObject<HTMLDivElement>;   
  value: string | null;
  confirmedRule: Pick<ITaskModel["rule"], "end_date" | "start_date" | "repeat" | "timer"|"priority"|"tags">;
  onSubmitSuccess: () => void; 
}

export const useCreateTaskSubmit = ({
  listId,
  sectionId,
  confirmList,
  value,
  confirmedRule,
  inputRef,
  onSubmitSuccess,
}: UseCreateTaskSubmitProps) => {
  const { mutate, isPending } = useCreateTask(confirmList);
  const { mutate: mutateWithSection, isPending: isPendingWithSection } =
    useCreateTaskWithSection(confirmList, sectionId);


const getCleanTaskName = (root: HTMLElement): string => {
  const clone = root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(".tag-chip, .priority-chip, .list-chip").forEach((chip) => chip.remove());
  return (clone.innerText ?? "").trim();
};

const buildTask = (): ICreateTaskDTO | null => {
  if (!value) return null;
  const el = inputRef.current;
  if (!el) return null;

  const inlineTags = Array.from(value.matchAll(ALL_ACTIVE_TAG_REGEX)).map((m) => m[1]);
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
    list: confirmList,
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

    if (confirmList!=listId) {
      mutate(task, {onSuccess:onSubmitSuccess, onError });
    } 
    else {
      mutateWithSection({ ...task, section: sectionId }, { onSuccess:onSubmitSuccess, onError });
    }
  };

  return { handleDone, isSubmitting: isPending || isPendingWithSection };
};

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosErr = error as { response?: { data?: { message?: string } } };
    return axiosErr.response?.data?.message ?? "Đã có lỗi xảy ra, vui lòng thử lại.";
  }
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra, vui lòng thử lại.";
};