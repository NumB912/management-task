import { create } from "zustand";
import { IListModel, IListModelState, ISectionModel, ISectionModelState, ITagModel, ITaskModel } from "../model";
import { IFilterModel } from "../model/filter.model";

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
  listInfo: Record<
    string,
    Pick<IListModelState, "isShareList" | "name" | "user" | "id">
  >;
  sectionIndex: Record<string, ISectionModelState>;
  tagInfo: Record<string, ITagModel>;
  filterInfo: Record<string, IFilterModel>;
  taskIndex: Record<string, ITaskModel>;
  taskLocation: Record<string, ITaskLocation>;
  setInboxCount: (inboxCount: number) => void;
  setTodayCount: (todayCount: number) => void;
  setNextDayCount: (nextDayCount: number) => void;
  setListInfo: (
    listId: string,
    info: Partial<Pick<IListModel, "isShareList" | "name" | "user" | "id">>,
  ) => void;
  removeListInfo: (listId: string) => void;
  setTagInfo: (tagId: string, info: Partial<ITagModel>) => void;
  removeTagInfo: (tagId: string) => void;
  setFilterInfo: (filterId: string, info: Partial<IFilterModel>) => void;
  removeFilterInfo: (filterId: string) => void;
  hasTag: (name: string | null) => boolean;
  hydrate: (data: HydrateData) => void;
  getTagWithName: (name: string) => ITagModel[];
  getListWithName: (
    name: string,
  ) =>
    | Pick<IListModel, "isShareList" | "name" | "user" | "id" | "sections">[]
    | undefined;
  getOverdueTasks: () => ITaskModel[];
  getTodayTaskCount: () => number;
  getNextDayCount: () => number;
  getInboxCount: () => number;
  getTodayInfo: () => ITaskModel[] | null;
  getNextInfo: () => ITaskModel[];
  getTaskTag: (tags: string[]) => ITaskModel[];
  getTaskFilter: (filter: IFilterModel) => ITaskModel[];
  getTaskById: (taskId: string) => ITaskModel | undefined;
  updateTask: (taskId: string, patch: Partial<ITaskModel>) => void;
  addTask: (task: ITaskModel, listId: string, sectionId: string) => void;
  // removeTask: (taskId: string) => void;
  reset: () => void;
}

const initialState = {
  inboxCount: 0,
  todayCount: 0,
  inbox: null,
  nextDayCount: 0,
  listInfo: {},
  tagInfo: {},
  filterInfo: {},
  taskIndex: {},
  taskLocation: {},
  sectionIndex: {},
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isGLTTomorrow = (date: Date, today: Date) => {
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return tomorrow <= date;
};
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
const flattenSections = (
  listInfo: Record<
    string,
    Pick<IListModel, "isShareList" | "name" | "user" | "id">
  >,
) => Object.values(listInfo).flatMap((info: any) => info.list.sections ?? []);

export const useWorkspaceStore = create<IWorkspaceState>((set, get) => ({
  ...initialState,
  setInboxCount: (inboxCount) => set(() => ({ inboxCount: inboxCount ?? 0 })),
  setNextDayCount: (nextDayCount) =>
    set(() => ({ nextDayCount: nextDayCount ?? 0 })),
  setTodayCount: (todayCount) => set(() => ({ todayCount: todayCount ?? 0 })),
  setListInfo: (listId, info) =>
    set((state) => {
      const current = state.listInfo[listId];
      return {
        listInfo: {
          ...state.listInfo,
          [listId]: {
            id: info?.id ?? current?.id ?? "",
            name: info?.name ?? current?.name ?? "",
            isShareList: info?.isShareList ?? current?.isShareList ?? false,
            user: info?.user ?? current?.user ?? "",
          },
        },
      };
    }),
  hasTag(tag) {
    return Object.entries(get().tagInfo).some(
      ([, data]) => data.name.toLocaleLowerCase() === tag?.toLocaleLowerCase(),
    );
  },

  getTaskFilter(filter: IFilterModel): ITaskModel[] {
    const {taskIndex} = get()
    const allTasks = Object.values(taskIndex)
    return allTasks.filter((task: any) => {
      if (task.status !== filter?.status) return false;
      if (filter.priority && task.rule?.priority !== filter.priority)
        return false;
      if (filter.tags && filter.tags.length > 0) {
        const taskTags: string[] = task.rule?.tags ?? [];
        const hasMatch = filter.tags.some((tag) =>
          taskTags.some(
            (t) => t.toLocaleLowerCase() === tag.toLocaleLowerCase(),
          ),
        );
        if (!hasMatch) return false;
      }

      const taskDate = task.rule?.start_date
        ? new Date(task.rule.start_date)
        : null;

      if (filter.start_date) {
        if (!taskDate || taskDate < new Date(filter.start_date)) return false;
      }
      if (filter.end_date) {
        if (!taskDate || taskDate > new Date(filter.end_date)) return false;
      }

      return true;
    });
  },
  removeListInfo: (listId) =>
    set((state) => {
      const { [listId]: _, ...rest } = state.listInfo;
      return { listInfo: rest };
    }),
  getOverdueTasks(): ITaskModel[] {
    const today = new Date();
     const {taskIndex} = get()
    return Object.values(taskIndex)
      .filter((task: ITaskModel) => {
        if (task.status !== "pending") return false;
        if (!task.rule?.start_date) return false;
        return isBeforeToday(new Date(task.rule.start_date), today);
      });
  },
  setTagInfo: (tagId, info) =>
    set((state) => {
      const current = state.tagInfo[tagId];
      return {
        tagInfo: {
          ...state.tagInfo,
          [tagId]: {
            id: info?.id ?? current?.id ?? "",
            name: info?.name ?? current?.name ?? "",
            description: info?.description ?? current?.description ?? "",
          },
        },
      };
    }),

  removeTagInfo: (tagId) =>
    set((state) => {
      const { [tagId]: _, ...rest } = state.tagInfo;
      return { tagInfo: rest };
    }),

  setFilterInfo: (filterId, info) =>
    set((state) => {
      const current = state.filterInfo[filterId];
      if (!info && !current) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[workspace-store] setFilterInfo: thiếu dữ liệu filter cho "${filterId}"`,
          );
        }
        return state;
      }
      return {
        filterInfo: {
          ...state.filterInfo,
          [filterId]: {
            ...current,
            ...info,
          },
        },
      };
    }),
  getNextDayCount() {
    const {taskIndex} = get()
    const today = new Date();
    return Object.values(taskIndex).filter((task: ITaskModel) => {
        if (task.status !== "pending") return false;
        if (!task.rule?.start_date) return false;
        return isGLTTomorrow(new Date(task.rule.start_date), today);
      }).length;
  },
  getInboxCount() {
    const { inbox, taskIndex } = get();
    if (!inbox) return 0;

    const taskArr = Object.values(taskIndex);

    return taskArr.filter((task: ITaskModel) => task.status === "pending")
      .length;
  },
  removeFilterInfo: (filterId) =>
    set((state) => {
      const { [filterId]: _, ...rest } = state.filterInfo;
      return { filterInfo: rest };
    }),

hydrate: (data) => {
  const listInfo: Record<
    string,
    Pick<IListModelState, "isShareList" | "name" | "user" | "id"|"sections">
  > = {};

  const sectionIndex: Record<string, ISectionModelState> = {};
  const taskIndex: Record<string, ITaskModel> = {};
  const taskLocation: Record<string, ITaskLocation> = {};

  for (const list of data.lists ?? []) {
    listInfo[list.id] = {
      id: list.id,
      name: list.name,
      user: list.user,
      isShareList: list.isShareList,
      sections: list.sections?.map(section=>section.id) ?? []
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
    listInfo,
    sectionIndex,
    taskIndex,
    taskLocation,
    tagInfo: Object.fromEntries(
      (data.tags ?? []).map((tag) => [tag.id, tag]),
    ),

    filterInfo: Object.fromEntries(
      (data.filters ?? []).map((filter) => [filter.id, filter]),
    ),
  });
},
  getTagWithName(name) {
    return Object.values(get().tagInfo).filter(
      (tag) =>
        tag.name.toLocaleLowerCase().startsWith(name.toLocaleLowerCase()) ||
        name == "",
    );
  },
  getListWithName(
    name: string,
  ):
    | Pick<IListModel, "isShareList" | "name" | "user" | "id">[]
    | undefined {
    return Object.values(get().listInfo)
      .filter((list) =>
        list.name.toLocaleLowerCase().includes(name?.toLocaleLowerCase()),
      );
  },
  getTodayTaskCount() {
    const {taskIndex} = get()
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

    return flattenSections(get().listInfo)
      .flatMap((section: any) => section.tasks ?? [])
      .filter((task: any) => {
        if (!task.rule?.tags?.length) return false;
        return task.rule.tags.some((taskTag: string) =>
          lowerTags.has(taskTag.toLocaleLowerCase()),
        );
      });
  },
  getTodayInfo(): ITaskModel[] {
    const today = new Date();

    return flattenSections(get().listInfo)
      .flatMap((section: any) => section.tasks ?? [])
      .filter(
        (task: any) =>
          task.status === "pending" &&
          task.rule?.start_date &&
          isSameDay(new Date(task.rule.start_date), today),
      );
  },
  getNextInfo(): ITaskModel[] {
    const {taskIndex} = get()
    const today = new Date();
    return Object.values(taskIndex).filter(
        (task: ITaskModel) =>
          task.status === "pending" &&
          task.rule?.start_date &&
          isGLTTomorrow(new Date(task.rule.start_date), today),
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

      if (
        typeof newVal === "object" &&
        newVal !== null
      ) {
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
  addTask: (task, listId, sectionId) =>
    set((state) => {
      const listItem = state.listInfo[listId];
      const section = state.sectionIndex[sectionId];
      if (!listItem) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[workspace-store] addTask: listId "${listId}" chưa tồn tại`,
          );
        }
        return state;
      }

      if (!section) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[workspace-store] addTask: sectionId "${sectionId}" chưa tồn tại`,
          );
        }
        return state;
      }

      return {
        taskIndex: { ...state.taskIndex, [task.id]: task },
        taskLocation: {
          ...state.taskLocation,
          [task.id]: { listId, sectionId },
        },
        sectionIndex: {
          ...state.sectionIndex,
          [sectionId]: {
            ...section,
            tasks: [...section.tasks, task.id],
          },
        },
      };
    }),

  // removeTask: (taskId) =>
  //   set((state) => {
  //     const location = state.taskLocation[taskId];
  //     if (!location) return state;

  //     const { listId, sectionId } = location;
  //     const listItem = state.listInfo[listId];
  //     if (!listItem) return state;

  //     const updatedSections = (listItem.list.sections as any[]).map(
  //       (section: any) =>
  //         section.id === sectionId
  //           ? {
  //               ...section,
  //               tasks: (section.tasks ?? []).filter(
  //                 (t: any) => t.id !== taskId,
  //               ),
  //             }
  //           : section,
  //     );

  //     const { [taskId]: _removedTask, ...restIndex } = state.taskIndex;
  //     const { [taskId]: _removedLocation, ...restLocation } =
  //       state.taskLocation;

  //     return {
  //       taskIndex: restIndex,
  //       taskLocation: restLocation,
  //       listInfo: {
  //         ...state.listInfo,
  //         [listId]: {
  //           ...listItem,
  //           list: { ...listItem.list, sections: updatedSections },
  //           taskCount: Math.max(0, listItem.taskCount - 1),
  //         },
  //       },
  //     };
  //   }),

  reset: () => set(() => ({ ...initialState })),
}));
