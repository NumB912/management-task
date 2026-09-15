import { create } from 'zustand'
import { IListModel, ITagModel, ITaskModel } from '../model'
import { IFilterModel } from '../model/filter.model'

export interface IlistInfo {
    list: Pick<IListModel, "sections" | "isShareList" | "name" | "user" | "id">
    taskCount: number
}

interface HydrateData {
    inbox: string | null,
    lists: IlistInfo[]
    tags: ITagModel[]
    filters: IFilterModel[]
}

interface IWorkspaceState {
    inboxCount: number
    todayCount: number
    inbox: string | null
    nextDayCount: number
    listInfo: Record<string, IlistInfo>
    tagInfo: Record<string, ITagModel>
    filterInfo: Record<string, IFilterModel>
    setInboxCount: (inboxCount: number) => void
    setTodayCount: (todayCount: number) => void
    setNextDayCount: (nextDayCount: number) => void
    setListInfo: (listId: string, info: Partial<IlistInfo>) => void
    incrementListCount: (listId: string, delta: number) => void
    removeListInfo: (listId: string) => void
    setTagInfo: (tagId: string, info: Partial<ITagModel>) => void
    removeTagInfo: (tagId: string) => void
    setFilterInfo: (filterId: string, info: Partial<IFilterModel>) => void
    removeFilterInfo: (filterId: string) => void
    hasTag: (name: string | null) => boolean
    hydrate: (data: HydrateData) => void
    getTagWithName: (name: string) => ITagModel[]
    getListWithName: (name: string) => Pick<IListModel, "isShareList" | "name" | "user" | "id" | "sections">[] | undefined
    getOverdueTasks: () => ITaskModel[]
    getTodayTaskCount: () => number
    getNextDayCount: () => number
    getInboxCount: () => number;
    getTodayInfo: () => ITaskModel[] | null
    getNextInfo: () => ITaskModel[]
    getTaskTag: (tags: string[]) => ITaskModel[]
    getTaskFilter: (filter: IFilterModel) => ITaskModel[],
    reset: () => void
}

const initialState = {
    inboxCount: 0,
    todayCount: 0,
    inbox: null,
    nextDayCount: 0,
    listInfo: {},
    tagInfo: {},
    filterInfo: {},
}

const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

const isGLTTomorrow = (date: Date, today: Date) => {
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    return tomorrow <= date
}
const isBeforeToday = (date: Date, today: Date) => {
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return dateStart < todayStart
}
const flattenSections = (listInfo: Record<string, IlistInfo>) =>
    Object.values(listInfo).flatMap((info: any) => info.list.sections ?? [])

export const useWorkspaceStore = create<IWorkspaceState>((set, get) => ({
    ...initialState,
    setInboxCount: (inboxCount) => set(() => ({ inboxCount: inboxCount ?? 0 })),
    setNextDayCount: (nextDayCount) => set(() => ({ nextDayCount: nextDayCount ?? 0 })),
    setTodayCount: (todayCount) => set(() => ({ todayCount: todayCount ?? 0 })),
    setListInfo: (listId, info) =>
        set((state) => {
            const current = state.listInfo[listId]
            return {
                listInfo: {
                    ...state.listInfo,
                    [listId]: {
                        list: {
                            id: info.list?.id ?? current?.list.id ?? "",
                            name: info.list?.name ?? current?.list.name ?? "",
                            isShareList: info.list?.isShareList ?? current?.list.isShareList ?? false,
                            user: info.list?.user ?? current?.list.user ?? "",
                            sections: info.list?.sections ?? current.list.sections ?? []
                        },
                        taskCount: info.taskCount ?? current?.taskCount ?? 0,
                    },
                },
            }
        }),
    hasTag(tag) {
        return Object.entries(get().tagInfo).some(
            ([, data]) => data.name.toLocaleLowerCase() === tag?.toLocaleLowerCase()
        );
    },

    incrementListCount: (listId, delta) =>
        set((state) => {
            const current = state.listInfo[listId]
            if (!current) {
                if (process.env.NODE_ENV === "development") {
                    console.warn(`[workspace-store] incrementListCount: listId "${listId}" chưa tồn tại`)
                }
                return state
            }
            return {
                listInfo: {
                    ...state.listInfo,
                    [listId]: { ...current, taskCount: Math.max(0, current.taskCount + delta) },
                },
            }
        }),

    getTaskFilter(filter: IFilterModel): ITaskModel[] {
        const allTasks = flattenSections(get().listInfo).flatMap(
            (section: any) => section.tasks ?? [],
        )

        return allTasks.filter((task: any) => {
            if (task.status !== filter?.status) return false
            if (filter.priority && task.rule?.priority !== filter.priority) return false
            if (filter.tags && filter.tags.length > 0) {
                const taskTags: string[] = task.rule?.tags ?? []
                const hasMatch = filter.tags.some((tag) =>
                    taskTags.some((t) => t.toLocaleLowerCase() === tag.toLocaleLowerCase()),
                )
                if (!hasMatch) return false
            }

            const taskDate = task.rule?.start_date ? new Date(task.rule.start_date) : null

            if (filter.start_date) {
                if (!taskDate || taskDate < new Date(filter.start_date)) return false
            }
            if (filter.end_date) {
                if (!taskDate || taskDate > new Date(filter.end_date)) return false
            }

            return true
        })
    },
    removeListInfo: (listId) =>
        set((state) => {
            const { [listId]: _, ...rest } = state.listInfo
            return { listInfo: rest }
        }),
    getOverdueTasks(): ITaskModel[] {
        const today = new Date()
        return flattenSections(get().listInfo)
            .flatMap((section: any) => section.tasks ?? [])
            .filter((task: any) => {
                if (task.status !== "pending") return false
                if (!task.rule?.start_date) return false
                return isBeforeToday(new Date(task.rule.start_date), today)
            })
    },
    setTagInfo: (tagId, info) =>
        set((state) => {
            const current = state.tagInfo[tagId]
            return {
                tagInfo: {
                    ...state.tagInfo,
                    [tagId]: {
                        id: info?.id ?? current?.id ?? "",
                        name: info?.name ?? current?.name ?? "",
                        description: info?.description ?? current?.description ?? "",
                    },
                },
            }
        }),

    removeTagInfo: (tagId) =>
        set((state) => {
            const { [tagId]: _, ...rest } = state.tagInfo
            return { tagInfo: rest }
        }),

    setFilterInfo: (filterId, info) =>
        set((state) => {
            const current = state.filterInfo[filterId]
            if (!info && !current) {
                if (process.env.NODE_ENV === "development") {
                    console.warn(`[workspace-store] setFilterInfo: thiếu dữ liệu filter cho "${filterId}"`)
                }
                return state
            }
            return {
                filterInfo: {
                    ...state.filterInfo,
                    [filterId]: {
                        ...current,
                        ...info,
                    },
                },
            }
        }),
    getNextDayCount() {
        const today = new Date()
        return flattenSections(get().listInfo)
            .flatMap((section: any) => section.tasks ?? [])
            .filter((task: any) => {
                if (task.status !== "pending") return false
                if (!task.rule?.start_date) return false
                return isGLTTomorrow(new Date(task.rule.start_date), today)
            }).length
    },
    getInboxCount() {
        const { inbox, listInfo } = get()
        if (!inbox) return 0

        const inboxList = listInfo[inbox]
        if (!inboxList) return 0

        return (inboxList.list.sections ?? [])
            .flatMap((section: any) => section.tasks ?? [])
            .filter((task: any) => task.status === "pending").length
    },
    removeFilterInfo: (filterId) =>
        set((state) => {
            const { [filterId]: _, ...rest } = state.filterInfo
            return { filterInfo: rest }
        }),

    hydrate: (data) => {
        set(() => ({
            inbox: data.inbox ?? null,
            listInfo: Object.fromEntries(
                (data?.lists ?? []).map((item) => [item.list.id, item]),
            ),
            tagInfo: Object.fromEntries(
                (data?.tags ?? []).map((item) => [item.id, item])
            ),
            filterInfo: Object.fromEntries(
                (data?.filters ?? []).map((item) => [item.id, item])
            ),
        }))
    },
    getTagWithName(name) {
        return Object.values(get().tagInfo).filter(
            (tag) => tag.name.toLocaleLowerCase().startsWith(name.toLocaleLowerCase()) || name == ""
        )
    },
    getListWithName(name: string): Pick<IListModel, "isShareList" | "name" | "user" | "id" | "sections">[] | undefined {
        return Object.values(get().listInfo)
            .map((item) => item.list)
            .filter((list) => list.name.toLocaleLowerCase().includes(name?.toLocaleLowerCase()));
    },
    getTodayTaskCount() {
        const today = new Date()
        return flattenSections(get().listInfo)
            .flatMap((section: any) => section.tasks ?? [])
            .filter((task: any) => {
                if (task.status !== "pending") return false
                if (!task.rule?.start_date) return false
                return isSameDay(new Date(task.rule.start_date), today)
            }).length
    },
    getTaskTag(tags: string[]): ITaskModel[] {
        if (!tags || tags.length === 0) return []

        const lowerTags = new Set(tags.map((t) => t.toLocaleLowerCase()))

        return flattenSections(get().listInfo)
            .flatMap((section: any) => section.tasks ?? [])
            .filter((task: any) => {
                if (!task.rule?.tags?.length) return false
                return task.rule.tags.some((taskTag: string) =>
                    lowerTags.has(taskTag.toLocaleLowerCase())
                )
            })
    },
    getTodayInfo(): ITaskModel[] {
        const today = new Date()

        return flattenSections(get().listInfo)
            .flatMap((section: any) => section.tasks ?? [])
            .filter((task: any) =>
                task.status === "pending" &&
                task.rule?.start_date &&
                isSameDay(new Date(task.rule.start_date), today)
            )
    },
    getNextInfo(): ITaskModel[] {
        const today = new Date()
        return flattenSections(get().listInfo)
            .flatMap((section: any) => section.tasks ?? [])
            .filter((task: any) =>
                task.status === "pending" &&
                task.rule?.start_date &&
                isGLTTomorrow(new Date(task.rule.start_date), today)
            )
    },
    reset: () => set(() => ({ ...initialState })),
}))