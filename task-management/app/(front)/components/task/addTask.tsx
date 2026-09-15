import { useTaskInputEditor } from "../../feature/hook/useTaskInputEditor.hook";
import { useCreateTaskSubmit } from "../../feature/hook/useCreateTaskSubmit.hook";
import { ICreateRuleDTO } from "../../model/DTO/rule.DTO";
import TaskInputEditor from "./TaskInputEditor";
import TaskAttributesBar from "./TaskAttributesBar";
import TaskActions from "./taskAction";
import { useEffect } from "react";
import { IRuleModel } from "../../model";

interface AddTaskProp {
  isCreate: boolean;
  setIsCreate: (isCreate: boolean) => void;
  sectionId: string;
  listId: string;
  defaultConfirmRule?: Partial<ICreateRuleDTO>;
}

const AddTask = ({ isCreate, setIsCreate, sectionId, listId, defaultConfirmRule }: AddTaskProp) => {
  const editor = useTaskInputEditor({ listId, defaultConfirmRule });
  const { handleDone, isSubmitting } = useCreateTaskSubmit({
    listId: listId,
    sectionId: editor.confirmSection ?? sectionId,  
    confirmList: editor.confirmList,
    value: editor.value,
    confirmedRule: editor.confirmRule as Pick<IRuleModel,"end_date"|"priority"|"repeat"|"start_date"|"tags"|"task"|"timer">,
    inputRef: editor.refDivInput as React.RefObject<HTMLDivElement>,
    onSubmitSuccess: () => {
      editor.resetEditor();
      setIsCreate(false);
    },
  });

  
  useEffect(() => {
    const el = editor.refDivInput.current;
    if (!el) return;
  
    const existingChip = el.querySelector<HTMLElement>(".priority-chip");
    const hasValidPriority = editor.confirmRule.priority && editor.confirmRule.priority!=4;
    if (editor.confirmRule.priority==4) {
      existingChip?.remove();
    }
    const desiredText = `P${editor.confirmRule.priority}`;
    const span = document.createElement("span");
    if(hasValidPriority){
        span.className = "priority-chip chip bg-primary-foreground text-primary!";
        span.setAttribute("contenteditable", "false");
        span.textContent = desiredText;
        el.appendChild(span);
        el.appendChild(document.createTextNode("\u00A0"));
    }
  
    el.querySelectorAll<HTMLElement>("[data-tag-chip]").forEach((chipEl) => {
      const id = chipEl.dataset.tagId;
      if (id && !editor.confirmRule.tags!.includes(id)) chipEl.remove();
    });
    editor.confirmRule.tags!.forEach((tagId) => {
      if (el.querySelector(`[data-tag-id="${tagId}"]`)) return;
      const span = document.createElement("span");
      span.className = "tag-chip chip bg-primary-foreground text-primary!";
      span.setAttribute("contenteditable", "false");
      span.dataset.tagChip = "";
      span.dataset.tagId = tagId;
      span.textContent = tagId;
      el.appendChild(span);
      const space = document.createTextNode("\u00A0")
      el.appendChild(space)
    });
  }, [listId]);

  const handleClose = () => {
    editor.resetEditor();
    setIsCreate(false);
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

  if (!isCreate) return null;
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
        confirmListName={editor.listInfo[editor.confirmList]?.list?.name}
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

      <TaskActions onCancel={handleClose} onSubmit={handleDone} isSubmitting={isSubmitting} />
    </div>
  );
};

export default AddTask;