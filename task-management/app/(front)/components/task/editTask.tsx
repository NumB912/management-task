import { useEffect, useState } from "react";
import { IRuleModel, ITaskModel } from "../../model";
import { useTaskInputEditor } from "../../feature/hook/useTaskInputEditor.hook";
import { useUpdateTaskSubmit } from "../../feature/hook/useUpdateTaskSubmit.hook";
import { ICreateRuleDTO, IUpdateRuleDTO } from "../../model/DTO/rule.DTO";
import TaskInputEditor from "./TaskInputEditor";
import TaskAttributesBar from "./TaskAttributesBar";
import TaskActions from "./taskAction";

interface EditTaskProp {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  task: ITaskModel;
  listId: string;
  onUpdateTask: (id:string,task: Partial<ITaskModel>) => void;
}

const buildRuleFromTask = (task: ITaskModel): IUpdateRuleDTO => ({
  repeat: task.rule?.repeat ?? { mode: "none", every: 0 },
  end_date: task.rule?.end_date ?? undefined,
  start_date: task.rule?.start_date ?? undefined,
  timer: task.rule?.timer ?? undefined,
  list: task.rule?.list ?? undefined,
  tags: task.rule?.tags ?? undefined,
  priority: task.rule?.priority ?? 4,
});

const EditTask = ({
  isEditing,
  setIsEditing,
  task,
  listId,
  onUpdateTask,
}: EditTaskProp) => {
  const [hydrated, setHydrated] = useState(false);
  const editor = useTaskInputEditor({ listId });

  useEffect(() => {
    if (!isEditing || hydrated || editor.lists.length === 0) return;
    editor.hydrateFromTask(task);
    editor.setConfirmRule(buildRuleFromTask(task));
    setHydrated(true);
  }, [isEditing, hydrated, editor.lists.length, task, listId]);

  useEffect(() => {
    setHydrated(false);
    editor.setIsEmpty(false)
  }, []);

  const { handleDone, isSubmitting } = useUpdateTaskSubmit({
    taskId: task.id,
    listId:listId,
    confirmedSection: editor.confirmSection,
    confirmList: editor.confirmList,
    value: editor.value,
    confirmedRule: editor.confirmRule as Pick<IRuleModel, "end_date" | "start_date" | "repeat" | "timer"|"tags"|"priority">,
    inputRef: editor.refDivInput as React.RefObject<HTMLDivElement>,
    onUpdateTask,
    onSubmitSuccess: () => {
      setIsEditing(false);
    },
  });

  const handleClose = () => {
    editor.setConfirmRule(buildRuleFromTask(task));
    editor.hydrateFromTask(task);
    setIsEditing(false);
    editor.setIsEmpty(false)
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !editor.isOpenAddTag) {
      e.preventDefault();
      handleDone();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    }
  };

useEffect(() => {
  const el = editor.refDivInput.current;
  if (!el || !isEditing || !hydrated) return;

  const existingChip = el.querySelector<HTMLElement>(".priority-chip");
  const hasValidPriority = editor.confirmRule.priority && editor.confirmRule.priority != 4;
  existingChip?.remove();

  if (hasValidPriority) {
    const span = document.createElement("span");
    span.className = "priority-chip chip bg-primary-foreground text-primary!";
    span.setAttribute("contenteditable", "false");
    span.textContent = `P${editor.confirmRule.priority}`;
    el.appendChild(span);
    el.appendChild(document.createTextNode("\u00A0"));
  }

  el.querySelectorAll<HTMLElement>("[data-tag-chip]").forEach((chipEl) => {
    const id = chipEl.dataset.tagId;
    if (id && !(editor.confirmRule.tags ?? []).includes(id)) chipEl.remove();
  });
  (editor.confirmRule.tags ?? []).forEach((tagId) => {
    if (el.querySelector(`[data-tag-id="${tagId}"]`)) return;
    const span = document.createElement("span");
    span.className = "tag-chip chip bg-primary-foreground text-primary!";
    span.setAttribute("contenteditable", "false");
    span.dataset.tagChip = "";
    span.dataset.tagId = tagId;
    span.textContent = tagId;
    el.appendChild(span);
    el.appendChild(document.createTextNode("\u00A0"));
  });
}, [isEditing, hydrated]); 

useEffect(()=>{  
  const el = editor.refDivInput.current;
  if (!el) return;
    const hasTextNode = Array.from(el.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );
    if (!hasTextNode) {
    el.appendChild(document.createTextNode(task.name));
  }
},[isEditing,task,listId])

  if(!isEditing) return null

  return (
    <div className="w-full h-fit relative max-w-70 p-3 flex-col flex-gap-2 border border-gray-200 rounded-md">
      <TaskInputEditor
        refDivInput={editor.refDivInput as React.RefObject<HTMLDivElement>}
        isEmpty={editor.isEmpty}
        onInput={editor.handleInput}
        onKeyDown={handleKeyDown}
        isOpenAddTag={editor.isOpenAddTag}
        setIsOpenAddTag={editor.setIsOpenAddTag}
        filteredTags={editor.filteredTags}
        tag={editor.tag}
        onAddTag={editor.handleAddTag}
        isOpenList={editor.isOpenList}
        setIsOpenList={editor.setIsOpenList}
        lists={editor.lists}
        onAddList={editor.handleAddList}
      />

      <TaskAttributesBar
        lists={editor.lists}
        confirmListName={editor.listInfo[editor.confirmList]?.list?.name ?? "Hộp thư"}
        onSelectList={editor.handleAddListBehind}
        confirmedRule={editor.confirmRule as Pick<IRuleModel,"end_date"|"priority"|"repeat"|"start_date"|"tags"|"task"|"timer">}
        onChangeRule={(partial) =>
          editor.setConfirmRule((prev) => ({ ...prev, ...partial }))
        }
        onSelectPriority={editor.handleAddpriorityBehind}
        confirmSectionName={
          editor.listInfo[editor.confirmList]?.list?.sections?.find(
            (section) => section.id == editor.confirmSection
          )?.name ?? ""
        }
      />

      <TaskActions onCancel={handleClose} onSubmit={handleDone} isSubmitting={isSubmitting} buttonContent="Chỉnh sửa"/>
    </div>
  );
};

export default EditTask;