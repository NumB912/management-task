import { useEffect, useRef, useState } from "react";
import { IListModel, IRuleModel, ISectionModel } from "../../model";
import { useWorkspaceStore } from "../../states/workspace.state";
import { useLists } from "./useListQuery.hook";

const ACTIVE_TAG_REGEX = /#([^\s]*)$/;
const ACTIVE_priority = /(?:^|\s)P([1-4])\s$/;
const ACTIVE_LIST_REGEX = /@([^\s]*)$/;

interface UseTaskInputEditorProps {
  listId: string;
  defaultConfirmRule?: Partial<IRuleModel>;
}

export const useTaskInputEditor = ({ listId,defaultConfirmRule }: UseTaskInputEditorProps) => {

    const buildDefaultRule = (override?: Partial<IRuleModel>): Pick<IRuleModel,"end_date"|"priority"|"repeat"|"start_date"|"tags"|"timer"> => {
      return ({
      priority: override?.priority ?? 4,
      repeat: override?.repeat ?? { mode: "none", dates: [], days: [], every: 0, specificDays: [] },
      end_date: override?.end_date ?? undefined,
      start_date: override?.start_date ?? undefined,
      tags: override?.tags ?? [],
      timer: override?.timer ?? undefined,
    })
    };

  const refDivInput = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const { getTagWithName, listIndex, getListWithName } = useWorkspaceStore();
  const [isOpenAddTag, setIsOpenAddTag] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState<string>("");
  const [confirmSection, setConfirmSection] = useState<string | undefined>(
    undefined,
  );
  const [confirmList, setConfirmList] = useState<string>(listId);
  const [confirmRule, setConfirmRule] = useState<Partial<IRuleModel>>(
    () => buildDefaultRule(defaultConfirmRule)
  );
  const [isOpenList, setIsOpenList] = useState<boolean>(false);
  const [allLists, setAllLists] = useState<
    Pick<IListModel, "id" | "isShareList" | "sections" | "name" | "user">[]
  >([]);
  const [lists, setLists] = useState<
    Pick<IListModel, "id" | "isShareList" | "sections" | "name" | "user">[]
  >([]);
  const filteredTags = tags.filter((t) => !confirmRule.tags!.includes(t));
  const resetEditor = () => {
    setValue(null);
    setTags([]);
    setTag("");
    setConfirmRule((prev=>{
      return {
        ...prev,
      priority: undefined,
      tags: [],
    }
    }));
    setConfirmSection(undefined);
    setIsOpenAddTag(false);
    setIsEmpty(true);
    setConfirmList(listId);
    if (refDivInput.current) refDivInput.current.innerText = "";
  };
  useEffect(() => {
    const data = getListWithName("");
    setAllLists(data ?? []);
    setLists(data ?? []);
  }, [listId]);

  const getTextBeforeCaret = (root: HTMLElement | null): string => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !root) return "";
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(root);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString();
  };

  const getChipTagFromDOM = (container: HTMLElement): string[] => {
    const chips = container.querySelectorAll<HTMLElement>(".tag-chip");
    return Array.from(chips).map(
      (chip) => chip.textContent?.replace("#", "") ?? "",
    );
  };

  const getChippriorityFromDOM = (
    container: HTMLElement,
  ): 1 | 2 | 3 | 4 | null => {
    const chip = container.querySelector<HTMLElement>(".priority-chip");
    if (!chip) return null;
    const num = Number(chip.textContent.trim()?.replace(/^P/, ""));
    if (!Number.isFinite(num) || num < 1 || num > 4) return null;
    return num as 1 | 2 | 3 | 4;
  };

  const getChipListFromDOM = (container: HTMLElement) => {
    const chip = container.querySelector<HTMLElement>(".list-chip");
    return chip?.dataset.listId ?? null;
  };

  useEffect(() => {
    const ref = refDivInput.current;
    const text = ref?.innerText ?? "";
    setIsEmpty(text.trim() === "");
    const textBeforeCaret = getTextBeforeCaret(ref ?? null);
    const priorityRegex = ACTIVE_priority.exec(textBeforeCaret);
    const tagRegex = ACTIVE_TAG_REGEX.exec(textBeforeCaret);
    const listRegex = ACTIVE_LIST_REGEX.exec(textBeforeCaret);
    if (priorityRegex) {
      handleAddpriority(priorityRegex);
      return;
    }
    if (listRegex) {
      setLists(
        allLists?.filter((list) =>
          list.name
            .toLocaleLowerCase()
            .includes(listRegex[1].toLocaleLowerCase()),
        ) ?? [],
      );
      setIsOpenList(true);
      return;
    }
    if (tagRegex) {
      const tagName = tagRegex[1];
      setTag(tagName);
      setTags(() => getTagWithName(tagName ?? "").map((t) => t.name));
      setIsOpenAddTag(true);
      return;
    }

    setIsOpenAddTag(false);
    setIsOpenList(false);
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setValue(el.innerText);
    setConfirmList(getChipListFromDOM(el)?.toString() ?? listId);
    setConfirmRule((prev) => {
      {
        return {
          ...prev,
          priority: (getChippriorityFromDOM(el) as 1 | 2 | 3 | 4 | null) ?? 4,
          tags: getChipTagFromDOM(el),
        };
      }
    });
  };
  const handleAddList = ({
    list,
    section,
  }: {
    list: Pick<
      IListModel,
      "id" | "isShareList" | "sections" | "name" | "user"
    > | null;
    section?: { id: string; name: string };
  }) => {
    const refInput = refDivInput.current;
    if (!list || !refInput) return;
    const chipCurrent = (refInput.querySelector(
      'span.list-chip[data-pending="true"]',
    ) ?? refInput.querySelector("span.list-chip")) as HTMLSpanElement | null;
    const textBeforeCaret = getTextBeforeCaret(refInput);
    const matchList = ACTIVE_LIST_REGEX.exec(textBeforeCaret);
    const sel = window.getSelection();
    const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;

    if (
      matchList?.index !== undefined &&
      range?.startContainer.nodeType === Node.TEXT_NODE
    ) {
      const textNode = range.startContainer;
      const matchStartInNode = range.startOffset - matchList[0].length;
      if (matchStartInNode >= 0) {
        const removeRange = document.createRange();
        removeRange.setStart(textNode, matchStartInNode);
        removeRange.setEnd(textNode, range.startOffset);
        removeRange.deleteContents();
      }
    }
    if (chipCurrent) {
      const freshChip = buildListChipElement(
        list,
        section as ISectionModel | undefined,
      );
      chipCurrent.replaceWith(freshChip);
      setValue(refInput.innerText);
      setIsOpenList(false);
      setConfirmList(list.id);
      setConfirmSection(section?.id);
      return;
    }

    const sel2 = window.getSelection();
    if (!sel2 || sel2.rangeCount === 0) return;
    const range2 = sel2.getRangeAt(0);
    const chip = buildListChipElement(
      list,
      section as ISectionModel | undefined,
    );
    range2.insertNode(chip);
    const spaceNode = document.createTextNode("\u00A0");
    chip.after(spaceNode);
    range2.setStartAfter(spaceNode);
    range2.collapse(true);
    sel2.removeAllRanges();
    sel2.addRange(range2);
    setConfirmList(list.id);
    setConfirmSection(section?.id);
    setValue(refInput.innerText);
    setIsOpenList(false);
  };

  const handleAddTag = (newTag: string | null) => {
    const refInput = refDivInput.current;
    if (!newTag || !refInput) return;

    const textBeforeCaret = getTextBeforeCaret(refInput);
    const match = ACTIVE_TAG_REGEX.exec(textBeforeCaret);
    if (match?.index === undefined) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.startContainer.nodeType !== Node.TEXT_NODE) return;

    const textNode = range.startContainer;
    const matchStartInNode = range.startOffset - match[0].length;
    const editRange = document.createRange();
    editRange.setStart(textNode, matchStartInNode);
    editRange.setEnd(textNode, range.startOffset);
    editRange.deleteContents();

    const chip = document.createElement("span");
    chip.className = "tag-chip chip bg-primary-foreground text-primary!";
    chip.contentEditable = "false";
    chip.dataset.tagId = newTag;
    chip.textContent = `#${newTag}`;
    editRange.insertNode(chip);

    const space = document.createTextNode("\u00A0");
    editRange.setStartAfter(chip);
    editRange.insertNode(space);
    editRange.setStartAfter(space);
    editRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(editRange);

    setConfirmRule((prev) => ({
      ...prev,
      tags: getChipTagFromDOM(refInput),
    }));
    setValue(refInput.innerText);
    setIsOpenAddTag(false);
  };
  const handleAddpriority = (newpriority: RegExpExecArray) => {
    const el = refDivInput.current;
    if (!el || !newpriority) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.startContainer.nodeType !== Node.TEXT_NODE) return;

    const matchedText = newpriority[0];
    const priorityDigit = newpriority[1];
    const cutStart = range.startOffset - matchedText.length;
    if (Number(priorityDigit) == 4) {
      return;
    }
    if (cutStart < 0) return;

    const priorityChipCurrent = el.querySelector<HTMLElement>(".priority-chip");
    if (priorityChipCurrent) {
      const textNode = document.createTextNode(
        priorityChipCurrent.textContent ?? "",
      );
      priorityChipCurrent.replaceWith(textNode);
    }

    const editRange = document.createRange();
    editRange.setStart(range.startContainer, cutStart);
    editRange.setEnd(range.startContainer, range.startOffset);
    editRange.deleteContents();

    const spaceBefore = document.createTextNode("\u00A0");
    editRange.insertNode(spaceBefore);
    editRange.setStartAfter(spaceBefore);
    editRange.collapse(true);

    const chip = document.createElement("span");
    chip.className = "priority-chip chip bg-primary-foreground text-primary!";
    chip.contentEditable = "false";
    chip.textContent = `P${priorityDigit}`;
    editRange.insertNode(chip);
    const spaceAfter = document.createTextNode("\u00A0");
    editRange.setStartAfter(chip);
    editRange.insertNode(spaceAfter);
    editRange.setStartAfter(spaceAfter);
    editRange.collapse(true);

    sel.removeAllRanges();
    sel.addRange(editRange);
    el.focus();
    setConfirmRule((prev) => ({
      ...prev,
      priority: Number(priorityDigit) as 1 | 2 | 3 | 4,
    }));
    setValue(el.innerText);
  };

  const handleAddpriorityBehind = (priorityDigit: string) => {

    const el = refDivInput.current;
    if (!el || !priorityDigit) return;

    const chipCurrent = el.querySelector<HTMLElement>(".priority-chip");

     if (Number(priorityDigit) === 4) {
    setConfirmRule((prev) => ({ ...prev, priority: 4 }));
    setValue(el.innerText);
    return;
  }

    if (chipCurrent) {
      const nextNode = chipCurrent.nextSibling;
      if (
        nextNode?.nodeType === Node.TEXT_NODE &&
        nextNode.textContent === "\u00A0"
      ) {
        nextNode.remove();
      }
      chipCurrent.remove();
    }
    if (el.textContent?.trim() === "" && el.childNodes.length === 1) {
      const onlyChild = el.childNodes[0];
      if (onlyChild.nodeName === "BR") onlyChild.remove();
    }
    const chip = document.createElement("span");
    chip.className = "priority-chip chip bg-primary-foreground text-primary!";
    chip.contentEditable = "false";
    chip.textContent = `P${priorityDigit}`;
    el.append(chip);
    el.append(document.createTextNode("\u00A0"));

    setConfirmRule((prev) =>{
      return {
      ...prev,
      priority: Number(priorityDigit) as 1 | 2 | 3 | 4,
    }
    });
    setValue(el.innerText);
  };

  const handleAddListBehind = ({
    list,
    section,
  }: {
    list: string;
    section?: string;
  }) => {
    const el = refDivInput.current;
    if (!el || !list) return;
    const chipCurrent = el.querySelector<HTMLElement>(".list-chip");
    if (chipCurrent) {
      const nextNode = chipCurrent.nextSibling;
      if (
        nextNode?.nodeType === Node.TEXT_NODE &&
        nextNode.textContent === "\u00A0"
      ) {
        nextNode.remove();
      }
      chipCurrent.remove();
    }
    if (el.textContent?.trim() === "" && el.childNodes.length === 1) {
      const onlyChild = el.childNodes[0];
      if (onlyChild.nodeName === "BR") onlyChild.remove();
    }

    const chip = buildListChipElement(list, section);
    el.append(chip);
    el.append(document.createTextNode("\u00A0"));
    setConfirmList(list);
    setConfirmSection(section);
    setValue(el.innerText);
  };

  const buildListChipElement = (
    list: Pick<IListModel, "id" | "isShareList" | "sections" | "name" | "user">,
    section?: ISectionModel,
  ): HTMLSpanElement => {
    const chip = document.createElement("span");
    chip.className = "list-chip chip bg-primary-foreground text-primary!";
    chip.contentEditable = "false";
    chip.dataset.listId = list.id;
    chip.dataset.sectionId = section?.id ?? "";

    const listSpan = document.createElement("span");
    listSpan.className = "list-chip-name";
    listSpan.textContent = `@${list.name}`;
    chip.append(listSpan);

    if (section) {
      const sectionSpan = document.createElement("span");
      sectionSpan.className = "list-chip-section text-primary!";
      sectionSpan.textContent = `/${section.name}`;
      chip.append(sectionSpan);
    }

    return chip;
  };
  const hydrateFromTask = (task: {
    name: string;
    list: string;
    section?: string;
    rule?: Partial<IRuleModel>;
  }) => {
    setValue(task.name);
    setConfirmSection(task.section);
    setConfirmList(task.list);
    setConfirmRule((prev) => {
      {
        return {
          ...prev,
          priority: task.rule?.priority,
          tags: task.rule?.tags ?? [],
        };
      }
    });
  };

  return {
    refDivInput,
    value,
    isEmpty,
    setIsEmpty,
    confirmRule,
    confirmList,
    hydrateFromTask,
    confirmSection,
    setConfirmSection,
    lists,
    filteredTags,
    tag,
    isOpenAddTag,
    setIsOpenAddTag,
    setConfirmRule,
    isOpenList,
    setIsOpenList,
    listIndex,
    handleInput,
    handleAddTag,
    handleAddList,
    handleAddpriorityBehind,
    handleAddListBehind,
    resetEditor,
    allLists,
  };
};
