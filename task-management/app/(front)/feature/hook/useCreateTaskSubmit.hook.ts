import { toast } from "sonner"; 
import { IRuleModel, ITaskModel } from "../../model";
import ObjectID from "bson-objectid";

const ALL_ACTIVE_TAG_REGEX = /#([^\s#]+)/g;

interface UseCreateTaskSubmitProps {
  listId: string;
  sectionId?: string;
  confirmList: string;
  inputRef: React.RefObject<HTMLDivElement>;   
  value: string | null;
  confirmedRule: IRuleModel;
  onHandleSubmit:(task:ITaskModel)=>void;
}

export const useCreateTaskSubmit = ({
  sectionId,
  confirmList,
  value,
  confirmedRule,
  inputRef,
  onHandleSubmit
}: UseCreateTaskSubmitProps) => {
const getCleanTaskName = (root: HTMLElement): string => {
  const clone = root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(".tag-chip, .priority-chip, .list-chip").forEach((chip) => chip.remove());
  return (clone.innerText ?? "").trim();
};

const buildTask = (): ITaskModel | null => {
  if (!value) return null;
  const el = inputRef.current;
  if (!el) return null;
  const inlineTags = Array.from(value.matchAll(ALL_ACTIVE_TAG_REGEX)).map((m) => m[1]);
  const allTags = Array.from(new Set([...confirmedRule.tags, ...inlineTags]));
  const cleanName = getCleanTaskName(el);
  if (cleanName.length === 0) return null;
  const TempIdTask = new ObjectID().toString();
 const TempIdRule = new ObjectID().toString();
  return {
    id:TempIdTask,
    name: cleanName,
    rule: {
      tags: allTags,
      priority: confirmedRule.priority,
      repeat: confirmedRule.repeat,
      end_date: confirmedRule.end_date,
      start_date: confirmedRule.start_date,
      timer: confirmedRule.timer,
      id:TempIdRule,
      task:TempIdTask,
      list:confirmList,
    },
    list: confirmList,
    children:[],
    section:sectionId,
    status:"pending",
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
    console.log(task)
   onHandleSubmit(task)
  };

  return { handleDone};
};
