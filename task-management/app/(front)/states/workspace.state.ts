import { create } from "zustand";
import { IListModel, IListModelState, ISectionModel, ISectionModelState, ITagModel, ITaskModel } from "../model";
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
    Pick<IListModelState, "isShareList" | "name" | "user" | "id"|"sections">
  >;
  sectionIndex: Record<string, ISectionModelState>;
  tagInfo: Record<string, ITagModel>;
  filterInfo: Record<string, IFilterModel>;
  taskIndex: Record<string, ITaskModel>;
  taskLocation: Record<string, ITaskLocation>;
  setInboxCount: (inboxCount: number) => void;
  setTodayCount: (todayCount: number) => void;
  setNextDayCount: (nextDayCount: number) => void;
  setlistIndex: (
    listId: string,
    info: Partial<Pick<IListModel, "isShareList" | "name" | "user" | "id"|"sections">>,
  ) => void;
  completeTaskAndCreateNext: (taskId: string, status: IStatus, nextTask?: ITaskModel, listId?: string, sectionId?: string) => void
  removelistIndex: (listId: string) => void;
  setTagInfo: (tagId: string, info: Partial<ITagModel>) => void;
  setSectionIndex:(sectionId:string,section:Partial<ISectionModelState>)=>void;
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
  updateTaskStatus: (taskId: string, status:IStatus) => void;
  getTaskWithSection:(sectionId:string)=>void
  moveSection: (startId:string, changeId:string) => void
  addTask: (task: ITaskModel, listId: string, sectionId: string) => void;
  // removeTask: (taskId: string) => void;
  reset: () => void;
}

const initialState = {
  inboxCount: 0,
  todayCount: 0,
  inbox: null,
  nextDayCount: 0,
  listIndex: {},
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
}

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
            sections:info.sections?.map((section)=>section.id)??[]
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
  removelistIndex: (listId) =>
    set((state) => {
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

    if (
      startIndex === -1 ||
      endIndex === -1 ||
      startIndex === endIndex
    ) {
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
  setSectionIndex:(sectionId,info)=>{
    const {sectionIndex} = get()
    set(()=>{

      return (
      {
          sectionIndex:{
        ...sectionIndex,
        [sectionId]:{
          ...sectionIndex[sectionId],
          ...info,
        }
      }
      })
    })
  },
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
    return Object.values(taskIndex).filter(
      (task) => task.status === "pending" && task.list === inbox
    ).length;
},
  removeFilterInfo: (filterId) =>
    set((state) => {
      const { [filterId]: _, ...rest } = state.filterInfo;
      return { filterInfo: rest };
    }),

hydrate: (data) => {
  const listIndex: Record<
    string,
    Pick<IListModelState, "isShareList" | "name" | "user" | "id"|"sections">
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
    listIndex,
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
  getTaskWithSection(sectionId:string){
    const {sectionIndex,taskIndex} = get()
    return sectionIndex[sectionId].tasks.map((task:string)=>taskIndex[task])
  },
  getListWithName(
    name: string,
  ):
    | Pick<IListModel, "isShareList" | "name" | "user" | "id">[]
    | undefined {
    return Object.values(get().listIndex)
      .filter((list) =>
        list.name.toLocaleLowerCase().includes(name?.toLocaleLowerCase()),
      );
  },
  getSectionWithList(listId:string){
    const {listIndex,sectionIndex} = get()
    return listIndex[listId].sections.map((section:string)=>sectionIndex[section])
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
    return Object.values(get().taskIndex).filter((task) => {
      if (!task.rule?.tags?.length) return false;
      return task.rule.tags.some((t) => lowerTags.has(t.toLocaleLowerCase()));
    });
},
getTodayInfo(): ITaskModel[] {
    const today = new Date();
    return Object.values(get().taskIndex).filter(
        (task) => task.status === "pending" && task.rule?.start_date && isSameDay(new Date(task.rule.start_date), today)
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
completeTaskAndCreateNext: (taskId: string, status: IStatus, nextTask?: ITaskModel, listId?: string, sectionId?: string)=>{
    set((state) => {
    const current = state.taskIndex[taskId];
    if (!current) return state;

    const newTaskIndex = {
      ...state.taskIndex,
      [taskId]: {
        ...current,
        status,
        rule: { ...current.rule, repeat: { ...current.rule.repeat, mode: "none" } },
      },
    };

    let newSectionIndex = state.sectionIndex;
    if (nextTask && sectionId) {
      newTaskIndex[nextTask.id] = nextTask;
      const section = state.sectionIndex[sectionId];
      if (section) {
        newSectionIndex = {
          ...state.sectionIndex,
          [sectionId]: { ...section, tasks: [...section.tasks, nextTask.id] },
        };
      }
    }

    return { taskIndex: newTaskIndex, sectionIndex: newSectionIndex };
  })
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
addTask: (task, listId, sectionId) =>
  set((state) => {
    const listItem = state.listIndex[listId];
    const section = state.sectionIndex[sectionId];
    if (!listItem) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[workspace-store] addTask: listId "${listId}" chưa tồn tại`);
      }
      return state;
    }
    if (!section) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[workspace-store] addTask: sectionId "${sectionId}" chưa tồn tại`);
      }
      return state;
    }

    return {
      taskIndex: { ...state.taskIndex, [task.id]: task },
      taskLocation: { ...state.taskLocation, [task.id]: { listId, sectionId } },
      sectionIndex: {
        ...state.sectionIndex,
        [sectionId]: {
          ...section,
          tasks: [...section.tasks, task.id], // tạo mảng mới thay vì push trực tiếp
        },
      },
    };
  }),

  // removeTask: (taskId) =>
  //   set((state) => {
  //     const location = state.taskLocation[taskId];
  //     if (!location) return state;

  //     const { listId, sectionId } = location;
  //     const listItem = state.listIndex[listId];
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
  //       listIndex: {
  //         ...state.listIndex,
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
