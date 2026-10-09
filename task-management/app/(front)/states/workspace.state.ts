import { create } from "zustand";
import {
  IListModel,
  IListModelState,
  IRuleModel,
  ISectionModel,
  ISectionModelState,
  ITagModel,
  ITaskModel,
} from "../model";
import { IFilterModel } from "../model/filter.model";
import { IStatus } from "../model/type/type";

interface HydrateData {
  inbox: string | null;
  lists: IListModel[];
  tags: ITagModel[];
  filters: IFilterModel[];
}

type TaskSlice = Pick<
  IWorkspaceState,
  "taskIndex" | "sectionIndex" | "listIndex"
>;
type infoList = Pick<
  IListModelState,
  "isShareList" | "name" | "user" | "id" | "sections" | "members" | "tasks"
>;

interface IWorkspaceState {
  inboxCount: number;
  todayCount: number;
  inbox: string | null;
  nextDayCount: number;
  listIndex: Record<string, infoList>;
  sectionIndex: Record<string, ISectionModelState>;
  tagIndex: Record<string, ITagModel>;
  filterIndex: Record<string, IFilterModel>;
  taskIndex: Record<string, ITaskModel>;
  updateFilter: (filterId: string, data: Partial<IFilterModel>) => void;
  addFilter: (data: IFilterModel) => void;
  setInboxCount: (inboxCount: number) => void;
  setTodayCount: (todayCount: number) => void;
  setNextDayCount: (nextDayCount: number) => void;
  setlistIndex: (listId: string, info: infoList) => void;
  setUpdateRoleMember: (DTO: {
    email: string;
    listId: string;
    role: IRoleMember;
  }) => void;
  addMember: (DTO: { listId: string; member: IMemberModel }) => void;
  removeMember: (DTO: { listId: string; email: string }) => void;
  removelistIndex: (listId: string) => void;
  updateListIndex: (listId: string, data: Pick<IListModel, "name">) => void;
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
  getListWithName: (name: string) => infoList[] | undefined;
  getTaskModel: (taskId: string) => ITaskModel | null;
  getSectionModel: (sectionId: string) => ISectionModel | null;
  getListModel: (listId: string) => IListModel | null;
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
  updateRule: (taskId: string, patch: Partial<IRuleModel>) => void;
  updateTaskStatus: (taskId: string, status: IStatus) => void;
  getTaskWithSection: (sectionId: string) => ITaskModel[];
  getTaskQuantityWithList: (listId: string) => number;
  getTaskQuantityWithTag: (name: string) => number;
  moveSection: (startId: string, changeId: string) => void;
  moveTask: (
    taskId: string,
    dto: { listId: string; sectionId: string | null },
  ) => void;
  moveTaskIntoSection: (taskId: string, newSectionId: string) => void;
  addSection: (
    listId: string,
    newSection: Pick<ISectionModelState, "name" | "id">,
  ) => void;
  editList: (listId: string, newName: string) => void;
  addList: (list: IListModel) => void;
  removeSection: (sectionId: string) => void;
  addTask: (task: ITaskModel) => void;
  updateStatusMember: (listId: string, member: IMemberModel) => void;
  addTag: (tag: ITagModel) => void;
  editTagWithShare: (name: string, tag: Pick<ITagModel, "name">) => void;
  editTagWithOnly: (name: string, tag: Pick<ITagModel, "name">) => void;
  removeTask: (taskId: string) => void;
  reset: () => void;
}

import { endOfDay, isToday, startOfDay } from "date-fns";
import { IMemberModel, IRoleMember } from "../model/member.model";

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
const applyRemoveTask = (
  state: TaskSlice,
  taskId: string,
): Partial<TaskSlice> | null => {
  const task = state.taskIndex[taskId];
  if (!task) return null;

  const { [taskId]: _removed, ...taskIndex } = state.taskIndex;

  if (task.section) {
    const section = state.sectionIndex[task.section];
    return {
      taskIndex,
      ...(section && {
        sectionIndex: {
          ...state.sectionIndex,
          [task.section]: {
            ...section,
            tasks: section.tasks.filter((id) => id !== taskId),
          },
        },
      }),
    };
  }

  const list = state.listIndex[task.list];
  return {
    taskIndex,
    ...(list && {
      listIndex: {
        ...state.listIndex,
        [task.list]: {
          ...list,
          tasks: (list.tasks ?? []).filter((id) => id !== taskId),
        },
      },
    }),
  };
};

const applyUpdateTask = (
  state: TaskSlice,
  taskId: string,
  patch: Partial<ITaskModel>,
): Partial<TaskSlice> | null => {
  const current = state.taskIndex[taskId];

  // Chưa có -> tạo mới
  if (!current) {
    if (!patch || Object.keys(patch).length === 0) return null;
    return applyAddTask(state, {
      ...patch,
      id: taskId,
      section: patch.section || undefined, // null -> undefined
    } as ITaskModel);
  }

  const hasChange = Object.keys(patch).some((key) => {
    const newVal = (patch as any)[key];
    const oldVal = (current as any)[key];
    return typeof newVal === "object" && newVal !== null
      ? JSON.stringify(newVal) !== JSON.stringify(oldVal)
      : newVal !== oldVal;
  });
  if (!hasChange) return null;

  // Xác định section/list đích
  const listChanged = patch.list !== undefined && patch.list !== current.list;
  const targetSection: string | null =
    "section" in patch
      ? (patch.section ?? null) // null/undefined => rời section
      : listChanged
        ? null // đổi list mà không nói section => rời section
        : (current.section ?? null);
  const targetList = targetSection
    ? (state.sectionIndex[targetSection]?.list ?? patch.list ?? current.list)
    : (patch.list ?? current.list);

  const updated: ITaskModel = {
    ...current,
    ...patch,
    section: targetSection ?? undefined,
    list: targetList,
  };

  if (targetSection === (current.section ?? null) && targetList === current.list) {
    return { taskIndex: { ...state.taskIndex, [taskId]: updated } };
  }
  const removed = applyRemoveTask(state, taskId);
  if (!removed) return null;
  return applyAddTask({ ...state, ...removed }, updated);
};

const applyAddTask = (
  state: TaskSlice,
  task: ITaskModel,
): Partial<TaskSlice> | null => {
  const list = state.listIndex[task.list];
  if (!list || state.taskIndex[task.id]) return null;
  const taskIndex = { ...state.taskIndex, [task.id]: task };
  if (task.section) {
    const section = state.sectionIndex[task.section];
    if (!section) return null;
    return {
      taskIndex,
      sectionIndex: {
        ...state.sectionIndex,
        [task.section]: { ...section, tasks: [...section.tasks, task.id] },
      },
    };
  }
  return {
    taskIndex,
    listIndex: {
      ...state.listIndex,
      [task.list]: { ...list, tasks: [...(list.tasks ?? []), task.id] },
    },
  };
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
            sections: info.sections ?? current?.sections ?? [],
            members: info.members ?? current?.members ?? [],
            tasks: info.tasks ?? [],
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
    set((state) => {
      const listItem = state.listIndex[listId];

      if (!listItem) return state;
      return {
        listIndex: {
          ...state.listIndex,
          [listId]: {
            ...listItem,
            name: newName,
          },
        },
      };
    });
  },
  updateStatusMember(listId, member) {
    set((state) => {
      let list = state.listIndex[listId];
      if (!list) return state;

      const target = member.email?.toLowerCase();
      if (!target) return state;

      const existing = list.members.find(
        (m) => m.email?.toLowerCase() === target,
      );
      if (existing?.status === "accept") return state;

      if (!list.isShareList) {
        list = {
          ...list,
          isShareList: true,
        };
      }

      const members = existing
        ? list.members.map((m) =>
            m.email?.toLowerCase() === target ? member : m,
          )
        : [...list.members, member];

      return {
        listIndex: {
          ...state.listIndex,
          [listId]: { ...list, members },
        },
      };
    });
  },
  addMember(DTO) {
    set((state) => {
      const { listId, member } = DTO;
      if (!listId || !member) return state;

      const list = state.listIndex[listId];
      if (!list) return state;

      const target = member.email?.toLowerCase();
      if (!target) return state;

      const existing = list.members.find(
        (m) => m.email?.toLowerCase() === target,
      );

      if (existing?.status === "accept") return state;

      const members = existing
        ? list.members.map((m) =>
            m.email?.toLowerCase() === target ? member : m,
          )
        : [...list.members, member];

      return {
        listIndex: {
          ...state.listIndex,
          [listId]: { ...list, members },
        },
      };
    });
  },
  updateFilter(filterId, data) {
    set((state) => {
      const filters = state.filterIndex;
      if (!filterId || !data) return state;
      const filter = filters[filterId];
      if (!filter) return state;

      return {
        filterIndex: {
          ...filters,
          [filterId]: {
            ...filter,
            ...data,
          },
        },
      };
    });
  },
  addFilter(data) {
    set((state) => {
      const filters = state.filterIndex;
      if (!data) return state;
      const filter = filters[data.id];
      if (!filter) return state;
      return {
        filterIndex: {
          ...filters,
          [data.id]: {
            ...data,
          },
        },
      };
    });
  },
  removeMember(DTO) {
    set((state) => {
      const { listId, email } = DTO;
      if (!listId || !email) return state;

      const list = state.listIndex[listId];
      if (!list) return state;

      const target = email.toLowerCase();
      const members = list.members.filter(
        (member) => member.email?.toLowerCase() !== target,
      );

      if (members.length === list.members.length) return state;

      return {
        listIndex: {
          ...state.listIndex,
          [listId]: { ...list, members },
        },
      };
    });
  },
  updateListIndex(listId, data) {
    set((state) => {
      const list = state.listIndex[listId];
      if (!list) return state;
      if (data.name === undefined || data.name === list.name) return state;

      return {
        listIndex: {
          ...state.listIndex,
          [listId]: {
            ...list,
            name: data.name,
          },
        },
      };
    });
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
      const listItem = state.listIndex[listId];
      if (!listItem) return state;
      const { [listId]: _, ...rest } = state.listIndex;
      const sectionIndex = Object.fromEntries(
        Object.entries(state.sectionIndex).filter(
          ([, section]) => section.list !== listId,
        ),
      );
      const taskIndex = Object.fromEntries(
        Object.entries(state.taskIndex).filter(
          ([, task]) => task.list !== listId,
        ),
      );
      return {
        listIndex: rest,
        taskIndex: taskIndex,
        sectionIndex: sectionIndex,
      };
    }),

  setUpdateRoleMember(DTO) {
    set((state) => {
      const { email, listId, role } = DTO;
      const list = state.listIndex[listId];
      if (!list) return state;

      const target = email.toLowerCase();
      const exists = list.members.some(
        (member) => member.email?.toLowerCase() === target,
      );
      if (!exists) return state;

      return {
        listIndex: {
          ...state.listIndex,
          [listId]: {
            ...list,
            members: list.members.map((member) =>
              member.email?.toLowerCase() === target
                ? { ...member, role }
                : member,
            ),
          },
        },
      };
    });
  },
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
  getTaskQuantityWithTag(name) {
    const { taskIndex, tagIndex } = get();
    const tagItem = tagIndex[name];
    if (!tagItem) return 0;

    const taskValues = Object.values(taskIndex) ?? [];

    const length = taskValues.filter(
      (task) => task.rule?.tags && task.rule.tags.some((tag) => tag == name),
    ).length;

    return length;
  },
  getTaskModel: (taskId) => get().taskIndex[taskId] ?? null,

  getSectionModel: (sectionId) => {
    const { sectionIndex, taskIndex } = get();
    const section = sectionIndex[sectionId];
    if (!section) return null;

    return {
      ...section,
      tasks: section.tasks
        .map((id) => taskIndex[id])
        .filter((task): task is ITaskModel => !!task),
    } as ISectionModel;
  },

  getListModel: (listId) => {
    const { listIndex, taskIndex } = get();
    const list = listIndex[listId];
    if (!list) return null;

    const { getSectionModel } = get();

    return {
      ...list,
      sections: list.sections
        .map((id) => getSectionModel(id))
        .filter((section): section is ISectionModel => !!section),
      tasks: (list.tasks ?? [])
        .map((id) => taskIndex[id])
        .filter((task): task is ITaskModel => !!task),
    } as IListModel;
  },
  addList(list) {
    if (!list?.id) return;

    set((state) => {
      const sections = list.sections ?? [];
      const tasks = sections.flatMap((section) => section.tasks ?? []);
      const sectionEntries = Object.fromEntries(
        sections.map((section) => [
          section.id,
          { ...section, tasks: (section.tasks ?? []).map((task) => task.id) },
        ]),
      );

      const taskEntries = Object.fromEntries(
        tasks.map((task) => [task.id, task]),
      );

      return {
        listIndex: {
          ...state.listIndex,
          [list.id]: {
            id: list.id,
            members: list.members,
            name: list.name,
            sections: sections.map((section) => section.id),
            user: list.user,
            isShareList: true,
            tasks: list.tasks?.map((task) => task.id) ?? [],
          },
        },
        sectionIndex: { ...state.sectionIndex, ...sectionEntries },
        taskIndex: { ...state.taskIndex, ...taskEntries },
      };
    });
  },

  moveTask: (taskId, { listId, sectionId = null }) =>
    set((state) => {
      const task = state.taskIndex[taskId];
      if (!task) return state;

      const fromSectionId = task.section ?? null;
      const fromListId = task.list;
      const unchanged = sectionId
        ? fromSectionId === sectionId
        : !fromSectionId && fromListId === listId;
      if (unchanged) return state;
      const toSection = sectionId ? state.sectionIndex[sectionId] : null;
      const toList = sectionId ? null : state.listIndex[listId];
      if (sectionId ? !toSection : !toList) return state;

      const targetListId = toSection ? toSection.list : listId;

      const sectionIndex = { ...state.sectionIndex };
      const listIndex = { ...state.listIndex };
      if (fromSectionId) {
        const from = sectionIndex[fromSectionId];
        if (from) {
          sectionIndex[fromSectionId] = {
            ...from,
            tasks: from.tasks.filter((id) => id !== taskId),
          };
        }
      } else {
        const fromList = listIndex[fromListId];
        if (fromList) {
          listIndex[fromListId] = {
            ...fromList,
            tasks: (fromList.tasks ?? []).filter((id) => id !== taskId),
          };
        }
      }

      // 2. Thêm vào nơi mới (lọc trước để không bị trùng id)
      if (toSection && sectionId) {
        sectionIndex[sectionId] = {
          ...toSection,
          tasks: [...toSection.tasks.filter((id) => id !== taskId), taskId],
        };
      } else if (toList) {
        listIndex[listId] = {
          ...toList,
          tasks: [
            ...(toList.tasks ?? []).filter((id) => id !== taskId),
            taskId,
          ],
        };
      }

      return {
        taskIndex: {
          ...state.taskIndex,
          [taskId]: {
            ...task,
            section: sectionId ?? undefined,
            list: targetListId,
          },
        },
        sectionIndex,
        listIndex,
      };
    }),

  moveTaskIntoSection: (taskId, newSectionId) => {
    const section = get().sectionIndex[newSectionId];
    if (!section) return;
    get().moveTask(taskId, { listId: section.list, sectionId: newSectionId });
  },
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
    const listIndex: Record<string, infoList> = {};
    const sectionIndex: Record<string, ISectionModelState> = {};
    const taskIndex: Record<string, ITaskModel> = {};

    for (const list of data.lists ?? []) {
      listIndex[list.id] = {
        id: list.id,
        name: list.name,
        user: list.user,
        isShareList: list.isShareList,
        sections: list.sections?.map((section) => section.id) ?? [],
        members: list.members,
        tasks: list.tasks?.map((task) => task.id) ?? [],
      };

      for (const task of list.tasks ?? []) {
        taskIndex[task.id] = task;
      }

      for (const section of list.sections ?? []) {
        sectionIndex[section.id] = {
          ...section,
          tasks: (section.tasks ?? []).map((t: ITaskModel) => t.id),
        };

        for (const task of section.tasks ?? []) {
          taskIndex[task.id] = task;
        }
      }
    }

    set({
      inbox: data.inbox ?? null,
      listIndex,
      sectionIndex,
      taskIndex,
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
  getListWithName(name: string): infoList[] | undefined {
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
        next7Day > new Date(task.rule.start_date),
    );
  },
  getTaskById(taskId: string): ITaskModel | undefined {
    return get().taskIndex[taskId];
  },
  updateTask: (taskId, patch) =>set((state)=>applyUpdateTask(state,taskId,patch)??state),
    // set((state) => {
    //   const currentTask = state.taskIndex[taskId];
    //   if (!currentTask) {
    //     if (!patch || Object.keys(patch).length === 0) {
    //       if (process.env.NODE_ENV === "development") {
    //         console.warn(
    //           `[workspace-store] updateTask: taskId "${taskId}" chưa tồn tại và patch rỗng`,
    //         );
    //       }
    //       return state;
    //     }

    //     const newTask = { ...patch, id: taskId } as ITaskModel;
    //     return state.addTask(newTask);
    //   }

    //   const hasChange = Object.keys(patch).some((key) => {
    //     const newVal = (patch as any)[key];
    //     const oldVal = (currentTask as any)[key];
    //     if (typeof newVal === "object" && newVal !== null) {
    //       return JSON.stringify(newVal) !== JSON.stringify(oldVal);
    //     }
    //     return newVal !== oldVal;
    //   });
    //   if (!hasChange) return state;

    //   const updatedTask = { ...currentTask, ...patch };
    //   const nextTaskIndex = { ...state.taskIndex, [taskId]: updatedTask };

    //   const isSectionChanged =
    //     patch.section !== undefined && patch.section !== currentTask.section;
    //   const isListChanged =
    //     patch.list !== undefined && patch.list !== currentTask.list;

    //   if (!isSectionChanged && !isListChanged) {
    //     return { taskIndex: nextTaskIndex };
    //   }

    //   const oldSectionId = currentTask.section;
    //   const newSectionId = updatedTask.section;
    //   const nextSectionIndex = { ...state.sectionIndex };

    //   const oldSection = oldSectionId
    //     ? nextSectionIndex[oldSectionId]
    //     : undefined;
    //   if (oldSection) {
    //     nextSectionIndex[oldSectionId!] = {
    //       ...oldSection,
    //       tasks: oldSection.tasks.filter((id) => id !== taskId),
    //     };
    //   }

    //   const newSection = newSectionId
    //     ? nextSectionIndex[newSectionId]
    //     : undefined;
    //   if (newSection) {
    //     nextSectionIndex[newSectionId!] = {
    //       ...newSection,
    //       tasks: [...newSection.tasks.filter((id) => id !== taskId), taskId],
    //     };
    //   }

    //   return {
    //     taskIndex: nextTaskIndex,
    //     sectionIndex: nextSectionIndex,
    //   };
    // }),
  updateRule: (taskId: string, patch: Partial<IRuleModel>) => {
    set((state) => {
      if (!taskId) {
        return state;
      }
      const tasks = state.taskIndex;
      const task = tasks[taskId];

      if (!task) {
        return state;
      }

      return {
        taskIndex: {
          ...tasks,
          [taskId]: {
            ...task,
            rule: {
              ...task.rule,
              ...patch,
            },
          },
        },
      };
    });
  },
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
          [newSection.id]: {
            ...newSection,
            list: listId,
            tasks: [],
          },
        },
      };
    });
  },
  editTagWithShare: (name, patch) =>
    set((state) => {
      const tagItem = state.tagIndex[name];
      if (!tagItem) return state;

      const newName = patch.name?.trim();
      const renamed = !!newName && newName !== name;
      if (!renamed) {
        return {
          tagIndex: { ...state.tagIndex, [name]: { ...tagItem, ...patch } },
        };
      }

      if (state.tagIndex[newName!]) return state;
      const tagIndex = Object.fromEntries(
        Object.entries(state.tagIndex).map(([key, value]) =>
          key === name
            ? [newName!, { ...value, ...patch, name: newName! }]
            : [key, value],
        ),
      );
      let taskChanged = false;
      const taskIndex = { ...state.taskIndex };
      for (const [id, task] of Object.entries(state.taskIndex)) {
        const tags = task.rule?.tags;
        if (!tags?.includes(name)) continue;

        taskChanged = true;
        taskIndex[id] = {
          ...task,
          rule: {
            ...task.rule,
            tags: [...new Set(tags.map((t) => (t === name ? newName! : t)))],
          },
        };
      }

      let filterChanged = false;
      const filterIndex = { ...state.filterIndex };
      for (const [id, filter] of Object.entries(state.filterIndex)) {
        if (!Array.isArray(filter.tags) || !filter.tags.includes(name))
          continue;
        filterChanged = true;
        filterIndex[id] = {
          ...filter,
          tags: filter.tags.map((t) => (t === name ? newName! : t)),
        };
      }
      return {
        tagIndex,
        taskIndex: taskChanged ? taskIndex : state.taskIndex,
        filterIndex: filterChanged ? filterIndex : state.filterIndex,
      };
    }),
  editTagWithOnly: (name, patch) =>
    set((state) => {
      const tagItem = state.tagIndex[name];
      if (!tagItem) return state;

      const newName = patch.name?.trim();

      if (!newName || newName === name) {
        return {
          tagIndex: { ...state.tagIndex, [name]: { ...tagItem, ...patch } },
        };
      }

      if (state.tagIndex[newName]) return state;
      let usedInShared = false;
      let taskChanged = false;
      const taskIndex = { ...state.taskIndex };

      for (const [id, task] of Object.entries(state.taskIndex)) {
        const tags = task.rule?.tags;
        if (!tags?.includes(name)) continue;

        if (state.listIndex[task.list]?.isShareList) {
          usedInShared = true;
          continue;
        }

        taskChanged = true;
        taskIndex[id] = {
          ...task,
          rule: {
            ...task.rule,
            tags: [...new Set(tags.map((t) => (t === name ? newName : t)))],
          },
        };
      }

      const tagIndex: typeof state.tagIndex = {};
      for (const [key, value] of Object.entries(state.tagIndex)) {
        if (key !== name) {
          tagIndex[key] = value;
          continue;
        }

        const renamed = { ...value, ...patch, name: newName };

        if (usedInShared) {
          tagIndex[name] = {
            ...value,
            name,
            isShareTag: true,
          };
        }
        tagIndex[newName] = renamed;
      }

      let filterChanged = false;
      const filterIndex = { ...state.filterIndex };
      for (const [id, filter] of Object.entries(state.filterIndex)) {
        if (!Array.isArray(filter.tags) || !filter.tags.includes(name))
          continue;
        filterChanged = true;
        filterIndex[id] = {
          ...filter,
          tags: filter.tags.map((t) => (t === name ? newName : t)),
        };
      }
      return {
        tagIndex,
        taskIndex: taskChanged ? taskIndex : state.taskIndex,
        filterIndex: filterChanged ? filterIndex : state.filterIndex,
      };
    }),
  addTag(tag) {
    set((state) => {
      const itemTag = state.tagIndex[tag.name];
      if (itemTag) return state;

      return {
        tagIndex: {
          ...state.tagIndex,
          [tag.name]: {
            ...tag,
          },
        },
      };
    });
  },
  addTask: (task) => set((state) => applyAddTask(state, task) ?? state),
  removeTask: (taskId) =>
    set((state) => {
      const task = state.taskIndex[taskId];
      if (!task) return state;

      const { [taskId]: _removedTask, ...taskIndex } = state.taskIndex;
      const sectionId = state.taskIndex[taskId]?.section ?? task.section;
      if (sectionId) {
        const sectionItem = state.sectionIndex[sectionId];
        return {
          taskIndex,
          sectionIndex: sectionItem
            ? {
                ...state.sectionIndex,
                [sectionId]: {
                  ...sectionItem,
                  tasks: sectionItem.tasks.filter((id) => id !== taskId),
                },
              }
            : state.sectionIndex,
        };
      }

      const listItem = state.listIndex[task.list];
      return {
        taskIndex,
        listIndex: listItem
          ? {
              ...state.listIndex,
              [task.list]: {
                ...listItem,
                tasks: (listItem.tasks ?? []).filter((id) => id !== taskId),
              },
            }
          : state.listIndex,
      };
    }),

  reset: () => set(() => ({ ...initialState })),
}));
