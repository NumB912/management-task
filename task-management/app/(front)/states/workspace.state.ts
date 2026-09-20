import { create } from "zustand";
import {
  IListModel,
  IListModelState,
  ISectionModelState,
  ITagModel,
  ITaskModel,
} from "../model";
import { IFilterModel } from "../model/filter.model";
import { IStatus } from "../model/type/type";

export interface ITaskLocation {
  listId: string;
  sectionId: string;
}

interface HydrateData {
  inbox: string | null;
  lists: IListModel[];
  tags: ITagModel[];
  filters: IFilterModel[];
}

interface IWorkspaceState {
  inboxCount: number;
  todayCount: number;
  inbox: string | null;
  nextDayCount: number;
  listIndex: Record<
    string,
    Pick<IListModelState, "isShareList" | "name" | "user" | "id" | "sections">
  >;
  sectionIndex: Record<string, ISectionModelState>;
  tagIndex: Record<string, ITagModel>;
  filterIndex: Record<string, IFilterModel>;
  taskIndex: Record<string, ITaskModel>;
  taskLocation: Record<string, ITaskLocation>;
  setInboxCount: (inboxCount: number) => void;
  setTodayCount: (todayCount: number) => void;
  setNextDayCount: (nextDayCount: number) => void;
  setlistIndex: (
    listId: string,
    info: Partial<
      Pick<IListModel, "isShareList" | "name" | "user" | "id" | "sections">
    >,
  ) => void;
  removelistIndex: (listId: string) => void;
  settagIndex: (tagId: string, info: Partial<ITagModel>) => void;
  setSectionIndex: (
    sectionId: string,
    section: Partial<ISectionModelState>,
  ) => void;
  removetagIndex: (nameTag: string) => void;
  setfilterIndex: (filterId: string, info: Partial<IFilterModel>) => void;
  removefilterIndex: (filterId: string) => void;
  hasTag: (name: string | null) => boolean;
  hydrate: (data: HydrateData) => void;
  getTag: (name: string) => ITagModel | null;
  getTagsWithName: (name: string) => ITagModel[];
  getListWithName: (
    name: string,
  ) =>
    | Pick<
        IListModelState,
        "isShareList" | "name" | "user" | "id" | "sections"
      >[]
    | undefined;
  getOverdueTasks: () => string[];
  getTodayTaskCount: () => number;
  getNextDayCount: () => number;
  getInboxCount: () => number;
  getFilterCount: (filterId: string) => number;
  getTagCount: (tagName: string) => number;
  getTodayInfo: () => string[] | null;
  getNextInfo: () => ITaskModel[];
  getTaskTag: (tags: string[]) => ITaskModel[];
  getTaskFilter: (filterId: string) => ITaskModel[];
  getTaskById: (taskId: string) => ITaskModel | undefined;
  updateTask: (taskId: string, patch: Partial<ITaskModel>) => void;
  updateTaskStatus: (taskId: string, status: IStatus) => void;
  getTaskWithSection: (sectionId: string) => ITaskModel[];
  getTaskQuantityWithList: (listId: string) => number;
  moveSection: (startId: string, changeId: string) => void;
  moveTaskIntoSection: (taskId: string, newSectionId: string) => void;
  addSection: (listId: string, newSection: ISectionModelState) => void;
  editList:(listId:string,newName:string)=>void;
  removeSection: (sectionId: string) => void;
  addTask: (task: ITaskModel) => void;
  changeIdSection: (tempId: string, id: string) => void;
  changeIdTask: (tempId: string, id: string) => void;
  removeTask: (taskId: string) => void;
  reset: () => void;
}

import { endOfDay, isToday, startOfDay } from "date-fns";

const toArray = <T>(v: T | T[] | null | undefined): T[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];

const toDate = (v: unknown): Date | null => {
  if (v == null || v === "") return null;
  const d = new Date(v as string | number | Date);
  return Number.isNaN(d.getTime()) ? null : d;
};

const SPECIALS: Record<string, (task: ITaskModel, now: Date) => boolean> = {
  no_date: (t) => !t.rule?.start_date,
  today: (t) => {
    const d = toDate(t.rule?.start_date);
    return !!d && isToday(d);
  },
  overdue: (t, now) => {
    const d = toDate(t.rule?.start_date);
    return !!d && d < startOfDay(now) && t.status === "pending";
  },
  repeat: (t) => !!t.rule?.repeat && t.rule.repeat.mode !== "none",
};

const initialState = {
  inboxCount: 0,
  todayCount: 0,
  inbox: null,
  nextDayCount: 0,
  listIndex: {},
  tagIndex: {},
  filterIndex: {},
  taskIndex: {},
  taskLocation: {},
  sectionIndex: {},
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const isBeforeToday = (date: Date, today: Date) => {
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return dateStart < todayStart;
};

export const useWorkspaceStore = create<IWorkspaceState>((set, get) => ({
  ...initialState,
  setInboxCount: (inboxCount) => set(() => ({ inboxCount: inboxCount ?? 0 })),
  setNextDayCount: (nextDayCount) =>
    set(() => ({ nextDayCount: nextDayCount ?? 0 })),
  setTodayCount: (todayCount) => set(() => ({ todayCount: todayCount ?? 0 })),
  setlistIndex: (listId, info) =>
    set((state) => {
      const current = state.listIndex[listId];
      return {
        listIndex: {
          ...state.listIndex,
          [listId]: {
            id: info?.id ?? current?.id ?? "",
            name: info?.name ?? current?.name ?? "",
            isShareList: info?.isShareList ?? current?.isShareList ?? false,
            user: info?.user ?? current?.user ?? "",
            sections: info.sections?.map((section) => section.id) ?? [],
          },
        },
      };
    }),
  hasTag(tag) {
    return Object.entries(get().tagIndex).some(
      ([, data]) => data.name.toLocaleLowerCase() === tag?.toLocaleLowerCase(),
    );
  },
editList(listId, newName) {
  set((state)=>{
    const listItem = state.listIndex[listId]

    if(!listItem) return state
    return {
      listIndex:{
        ...state.listIndex,
        [listId]:{
          ...listItem,
          name:newName
        }
      }
    }
  })
},
  getTaskFilter(filterId: string): ITaskModel[] {
    const { taskIndex, filterIndex } = get();
    const filter = filterIndex[filterId];
    if (!filter) return [];

    const statuses = toArray(filter.status);
    const priorities = toArray(filter.priority);
    const tags = toArray<string>(filter.tags);
    const specials = toArray<string>(filter.specials);

    const from = toDate(filter.start_date);
    const to = toDate(filter.end_date);
    const rangeStart = from ? startOfDay(from).getTime() : null;
    const rangeEnd = to ? endOfDay(to).getTime() : null;

    const now = new Date();

    return Object.values(taskIndex).filter((task: ITaskModel) => {
      if (statuses.length && !statuses.includes(task.status)) return false;

      if (
        priorities.length &&
        !priorities.includes(task.rule?.priority as never)
      ) {
        return false;
      }

      if (tags.length) {
        const taskTagSet = new Set(task.rule?.tags ?? []);
        if (!tags.every((t) => taskTagSet.has(t))) return false;
      }

      if (rangeStart !== null || rangeEnd !== null) {
        const d = toDate(task.rule?.start_date);
        if (!d) return false;
        const time = d.getTime();
        if (rangeStart !== null && time < rangeStart) return false;
        if (rangeEnd !== null && time > rangeEnd) return false;
      }

      if (specials.length) {
        const ok = specials.every((key) => SPECIALS[key]?.(task, now) ?? true);
        if (!ok) return false;
      }

      return true;
    });
  },
  removelistIndex: (listId) =>
    set((state) => {
      const listItem = state.listIndex[listId]
      if(!listItem) return state
      const { [listId]: _, ...rest } = state.listIndex;
      return { listIndex: rest };
    }),
  moveSection: (startId, changeId) => {
    set((state) => {
      const list = state.listIndex[state.sectionIndex[startId].list];

      if (!list) return state;

      const sections = list.sections;

      const startIndex = sections.indexOf(startId);
      const endIndex = sections.indexOf(changeId);

      if (startIndex === -1 || endIndex === -1 || startIndex === endIndex) {
        return state;
      }

      const newSections = [...sections];

      const [removed] = newSections.splice(startIndex, 1);

      newSections.splice(endIndex, 0, removed);

      return {
        listIndex: {
          ...state.listIndex,
          [list.id]: {
            ...list,
            sections: newSections,
          },
        },
      };
    });
  },
  getTaskQuantityWithList: (listId, onlyPending = true) => {
    const { listIndex, sectionIndex, taskIndex } = get();
    const list = listIndex[listId];
    if (!list) return 0;

    let count = 0;
    for (const sectionId of list.sections) {
      for (const taskId of sectionIndex[sectionId]?.tasks ?? []) {
        const task = taskIndex[taskId];
        if (!task) continue;
        if (onlyPending && task.status !== "pending") continue;
        count++;
      }
    }
    return count;
  },
  moveTaskIntoSection: (taskId, newSectionId) =>
    set((state) => {
      const task = state.taskIndex[taskId];
      if (!task) return state;
      if (task.section === newSectionId) return state;
      const from = state.sectionIndex[task.section];
      const to = state.sectionIndex[newSectionId];
      if (!from || !to) return state;
      const taskIndex = { ...state.taskIndex };

      return {
        taskIndex:{
          ...state.taskIndex,
          [taskId]:{
            ...task,
            section:to.id,
            list:to.list,
          }
        },
        sectionIndex: {
          ...state.sectionIndex,
          [task.section]: {
            ...from,
            tasks: from.tasks.filter((id) => id !== taskId),
          },
          [newSectionId]: {
            ...to,
            tasks: [...to.tasks.filter((id) => id !== taskId), taskId],
          },
        },
      };
    }),
  removeSection: (sectionId) => {
    set((state) => {
      const { [sectionId]: _, ...rest } = state.sectionIndex;
      return {
        sectionIndex: {
          ...rest,
        },
      };
    });
  },
  setSectionIndex: (sectionId, info) => {
    const { sectionIndex } = get();
    set(() => {
      return {
        sectionIndex: {
          ...sectionIndex,
          [sectionId]: {
            ...sectionIndex[sectionId],
            ...info,
          },
        },
      };
    });
  },
  getOverdueTasks(): string[] {
    const today = new Date();
    const { taskIndex } = get();
    return Object.values(taskIndex)
      .filter((task: ITaskModel) => {
        if (task.status !== "pending") return false;
        if (!task.rule?.start_date) return false;
        return isBeforeToday(new Date(task.rule.start_date), today);
      })
      .map((task: ITaskModel) => task.id);
  },
  settagIndex: (tagId, info) =>
    set((state) => {
      const current = state.tagIndex[tagId];
      return {
        tagIndex: {
          ...state.tagIndex,
          [tagId]: {
            id: info?.id ?? current?.id ?? "",
            name: info?.name ?? current?.name ?? "",
            description: info?.description ?? current?.description ?? "",
          },
        },
      };
    }),
  removetagIndex: (nameTag: string) =>
    set((state) => {
      if (!(nameTag in state.tagIndex)) return state;
      const { [nameTag]: _removed, ...restTags } = state.tagIndex;
      let taskChanged = false;
      const taskIndex = { ...state.taskIndex };
      for (const [id, task] of Object.entries(state.taskIndex)) {
        const tags = task.rule?.tags;
        if (!tags?.includes(nameTag)) continue;

        taskChanged = true;
        taskIndex[id] = {
          ...task,
          rule: { ...task.rule, tags: tags.filter((tag) => tag !== nameTag) },
        };
      }

      let filterChanged = false;
      const filterIndex = { ...state.filterIndex };
      for (const [id, filter] of Object.entries(state.filterIndex)) {
        const tags = filter.tags;
        const has = Array.isArray(tags)
          ? tags.includes(nameTag)
          : tags === nameTag;
        if (!has) continue;

        filterChanged = true;
        filterIndex[id] = {
          ...filter,
          tags: Array.isArray(tags)
            ? tags.filter((tag) => tag !== nameTag)
            : [],
        };
      }

      return {
        tagIndex: restTags,
        taskIndex: taskChanged ? taskIndex : state.taskIndex,
        filterIndex: filterChanged ? filterIndex : state.filterIndex,
      };
    }),
  setfilterIndex: (filterId, info) =>
    set((state) => {
      const current = state.filterIndex[filterId];
      if (!info && !current) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[workspace-store] setfilterIndex: thiếu dữ liệu filter cho "${filterId}"`,
          );
        }
        return state;
      }
      return {
        filterIndex: {
          ...state.filterIndex,
          [filterId]: {
            ...current,
            ...info,
          },
        },
      };
    }),
  getNextDayCount() {
    const { taskIndex } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    next7Days.setHours(0, 0, 0, 0);
    return Object.values(taskIndex).filter((task: ITaskModel) => {
      if (task.status !== "pending") return false;
      if (!task.rule?.start_date) return false;
      return (
        new Date(task.rule.start_date) >= today &&
        new Date(task.rule.start_date) <= next7Days
      );
    }).length;
  },
  getInboxCount() {
    const { inbox, taskIndex } = get();
    if (!inbox) return 0;
    return Object.values(taskIndex).filter(
      (task) => task.status === "pending" && task.list === inbox,
    ).length;
  },
  removefilterIndex: (filterId) =>
    set((state) => {
      const { [filterId]: _, ...rest } = state.filterIndex;
      return { filterIndex: rest };
    }),
  getTagCount(tagName) {
    const { taskIndex } = get();
    const tasks = Object.values(taskIndex).filter((task) =>
      task.rule.tags.includes(tagName),
    );
    return tasks.length ?? 0;
  },
  getFilterCount(filterId) {
    const { filterIndex } = get();
    const filter = filterIndex[filterId];
    if (!filter) {
      return 0;
    }

    return 0;
  },
  hydrate: (data) => {
    const listIndex: Record<
      string,
      Pick<IListModelState, "isShareList" | "name" | "user" | "id" | "sections">
    > = {};

    const sectionIndex: Record<string, ISectionModelState> = {};
    const taskIndex: Record<string, ITaskModel> = {};
    const taskLocation: Record<string, ITaskLocation> = {};
    for (const list of data.lists ?? []) {
      listIndex[list.id] = {
        id: list.id,
        name: list.name,
        user: list.user,
        isShareList: list.isShareList,
        sections: list.sections?.map((section) => section.id) ?? [],
      };

      for (const section of list.sections ?? []) {
        sectionIndex[section.id] = {
          ...section,
          tasks: (section.tasks ?? []).map((t: ITaskModel) => t.id),
        };

        for (const task of section.tasks ?? []) {
          taskIndex[task.id] = task;
          taskLocation[task.id] = {
            listId: list.id,
            sectionId: section.id,
          };
        }
      }
    }

    set({
      inbox: data.inbox ?? null,
      listIndex,
      sectionIndex,
      taskIndex,
      taskLocation,
      tagIndex: Object.fromEntries(
        (data.tags ?? []).map((tag) => [tag.name, tag]),
      ),

      filterIndex: Object.fromEntries(
        (data.filters ?? []).map((filter) => [filter.id, filter]),
      ),
    });
  },
  getTag(name) {
    const { tagIndex } = get();

    const tagItem = tagIndex[name];

    if (!tagItem) return null;

    return tagItem;
  },
  getTagsWithName(name) {
    return Object.values(get().tagIndex).filter(
      (tag) =>
        tag.name.toLocaleLowerCase().startsWith(name.toLocaleLowerCase()) ||
        name == "",
    );
  },
  getTaskWithSection(sectionId: string) {
    const { sectionIndex, taskIndex } = get();

    if (!sectionIndex[sectionId]) {
      return [];
    }

    return (
      sectionIndex[sectionId]?.tasks?.map((task: string) => taskIndex[task]) ??
      []
    );
  },
  getListWithName(
    name: string,
  ):
    | Pick<
        IListModelState,
        "isShareList" | "name" | "user" | "id" | "sections"
      >[]
    | undefined {
    return Object.values(get().listIndex).filter((list) =>
      list.name.toLocaleLowerCase().includes(name?.toLocaleLowerCase()),
    );
  },
  getSectionWithList(listId: string) {
    const { listIndex, sectionIndex } = get();
    return listIndex[listId].sections.map(
      (section: string) => sectionIndex[section],
    );
  },
  getTodayTaskCount() {
    const { taskIndex } = get();
    const today = new Date();
    return Object.values(taskIndex).filter((task: ITaskModel) => {
      if (task.status !== "pending") return false;
      if (!task.rule?.start_date) return false;
      return isSameDay(new Date(task.rule.start_date), today);
    }).length;
  },
  getTaskTag(tags: string[]): ITaskModel[] {
    if (!tags || tags.length === 0) return [];
    const lowerTags = new Set(tags.map((t) => t.toLocaleLowerCase()));
    return Object.values(get().taskIndex).filter((task) => {
      if (!task.rule?.tags?.length) return false;
      return task.rule.tags.some((t) => lowerTags.has(t.toLocaleLowerCase()));
    });
  },
  getTodayInfo(): string[] {
    const today = new Date();
    return Object.values(get().taskIndex)
      .filter(
        (task) =>
          task.status === "pending" &&
          task.rule?.start_date &&
          isSameDay(new Date(task.rule.start_date), today),
      )
      .map((task) => task.id);
  },
  getNextInfo(): ITaskModel[] {
    const { taskIndex } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next7Day = new Date();
    next7Day.setDate(today.getDate() + 7);
    next7Day.setHours(0, 0, 0, 0);
    return Object.values(taskIndex).filter(
      (task: ITaskModel) =>
        task.rule?.start_date &&
        new Date(task.rule.start_date) >= today &&
        next7Day >= new Date(task.rule.start_date),
    );
  },
  getTaskById(taskId: string): ITaskModel | undefined {
    return get().taskIndex[taskId];
  },
  updateTask: (taskId, patch) =>
    set((state) => {
      const currentTask = state.taskIndex[taskId];
      if (!currentTask) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[workspace-store] updateTask: taskId "${taskId}" chưa tồn tại`,
          );
        }

        return state;
      }

      const hasChange = Object.keys(patch).some((key) => {
        const newVal = (patch as any)[key];
        const oldVal = (currentTask as any)[key];

        if (typeof newVal === "object" && newVal !== null) {
          return JSON.stringify(newVal) !== JSON.stringify(oldVal);
        }

        return newVal !== oldVal;
      });

      if (!hasChange) return state;

      const updatedTask = {
        ...currentTask,
        ...patch,
      };

      return {
        taskIndex: {
          ...state.taskIndex,
          [taskId]: updatedTask,
        },
      };
    }),
  setTask: (taskId: string, task: ITaskModel) =>
    set((state) => ({
      taskIndex: {
        ...state.taskIndex,
        [taskId]: task,
      },
    })),
  updateTaskStatus: (taskId, status) =>
    set((state) => {
      const currentTask = state.taskIndex[taskId];

      if (!currentTask) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[workspace-store] updateTaskStatus: taskId "${taskId}" chưa tồn tại`,
          );
        }
        return state;
      }

      return {
        taskIndex: {
          ...state.taskIndex,
          [taskId]: {
            ...currentTask,
            status,
          },
        },
      };
    }),
  addSection(listId, newSection) {
    set((state) => {
      const listItem = state.listIndex[listId];

      if (!listItem) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[workspace-store] addTask: listId "${listId}" chưa tồn tại`,
          );
        }
        return state;
      }

      return {
        listIndex: {
          ...state.listIndex,
          [listId]: {
            ...listItem,
            sections: [...listItem.sections, newSection.id],
          },
        },
        sectionIndex: {
          ...state.sectionIndex,
          [newSection.id]: newSection,
        },
      };
    });
  },
  changeIdSection: (tempId, id) => {
    set((state) => {
      const itemSection = state.sectionIndex[tempId];
      if (!itemSection) return state;

      const list = state.listIndex[itemSection.list];
      const { [tempId]: _removed, ...restSections } = state.sectionIndex;

      return {
        sectionIndex: {
          ...restSections,
          [id]: { ...itemSection, id },
        },
        listIndex: list
          ? {
              ...state.listIndex,
              [itemSection.list]: {
                ...list,
                sections: list.sections.map((sid) =>
                  sid === tempId ? id : sid,
                ),
              },
            }
          : state.listIndex,
      };
    });
  },
  changeIdTask: (tempId, id) =>
    set((state) => {
      const task = state.taskIndex[tempId];
      if (!task) return state;

      const { [tempId]: _removed, ...restTasks } = state.taskIndex;
      const section = state.sectionIndex[task.section];

      return {
        taskIndex: {
          ...restTasks,
          [id]: { ...task, id },
        },
        sectionIndex: section
          ? {
              ...state.sectionIndex,
              [task.section]: {
                ...section,
                tasks: section.tasks.map((t) => (t === tempId ? id : t)),
              },
            }
          : state.sectionIndex,
      };
    }),
  addTask: (task) =>
    set((state) => {
      const listItem = state.listIndex[task.list];
      const section = state.sectionIndex[task.section];
      if (!listItem) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[workspace-store] addTask: listId "${task.list}" chưa tồn tại`,
          );
        }
        return state;
      }
      if (!section) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[workspace-store] addTask: sectionId "${task.section}" chưa tồn tại`,
          );
        }
        return state;
      }

      return {
        taskIndex: { ...state.taskIndex, [task.id]: task },
        taskLocation: {
          ...state.taskLocation,
          [task.id]: { listId: task.list, sectionId: task.section },
        },
        sectionIndex: {
          ...state.sectionIndex,
          [task.section]: {
            ...section,
            tasks: [...section.tasks, task.id],
          },
        },
      };
    }),

  removeTask: (taskId) =>
    set((state) => {
      const task = state.taskIndex[taskId];
      if (!task) return state;
      const sectionItem = state.sectionIndex[task.section];
      if (!sectionItem) return state;

      const { [task.id]: _, ...taskIndex } = state.taskIndex;

      return {
        sectionIndex: {
          ...state.sectionIndex,
          [task.section]: {
            ...sectionItem,
            tasks: sectionItem.tasks.filter((task) => task !== taskId),
          },
        },
        taskIndex: {
          ...taskIndex,
        },
      };
    }),

  reset: () => set(() => ({ ...initialState })),
}));
