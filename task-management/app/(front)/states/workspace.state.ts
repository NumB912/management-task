import { create } from 'zustand'
import { IListModel, ITagModel } from '../model'
import { IFilterModel } from '../model/filter.model'

export interface IlistInfo {
    list: Pick<IListModel,"sections"|"isShareList" | "name" | "user" | "id">
    taskCount: number
}

interface HydrateData {
    inboxCount: number
    todayCount: number
    nextDayCount: number
    inbox:string|null,
    lists: IlistInfo[]
    tags: ITagModel[]
    filters: IFilterModel[]
}

interface IWorkspaceState {
    inboxCount: number
    todayCount: number
    inbox:string|null
    nextDayCount: number
    listTaskInfo: Record<string, IlistInfo>
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
    getListWithName: (name: string) => Pick<IListModel, "isShareList" | "name" | "user" | "id"|"sections">[] | undefined
    reset: () => void
}


const initialState = {
    inboxCount: 0,
    todayCount: 0,
    inbox:null,
    nextDayCount: 0,
    listTaskInfo: {},
    tagInfo: {},
    filterInfo: {},
}

export const useWorkspaceStore = create<IWorkspaceState>((set, get) => ({
    ...initialState,

    setInboxCount: (inboxCount) => set(() => ({ inboxCount: inboxCount ?? 0 })),
    setNextDayCount: (nextDayCount) => set(() => ({ nextDayCount: nextDayCount ?? 0 })),
    setTodayCount: (todayCount) => set(() => ({ todayCount: todayCount ?? 0 })),
    setListInfo: (listId, info) =>
        set((state) => {
            const current = state.listTaskInfo[listId]
            return {
                listTaskInfo: {
                    ...state.listTaskInfo,
                    [listId]: {
                        list: {
                            id: info.list?.id ?? current?.list.id ?? "",
                            name: info.list?.name ?? current?.list.name ?? "",
                            isShareList: info.list?.isShareList ?? current?.list.isShareList ?? false,
                            user: info.list?.user ?? current?.list.user ?? "",
                            sections:info.list?.sections ?? current.list.sections ?? []

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
            const current = state.listTaskInfo[listId]
            if (!current) {
                if (process.env.NODE_ENV === "development") {
                    console.warn(`[workspace-store] incrementListCount: listId "${listId}" chưa tồn tại`)
                }
                return state
            }
            return {
                listTaskInfo: {
                    ...state.listTaskInfo,
                    [listId]: { ...current, taskCount: Math.max(0, current.taskCount + delta) },
                },
            }
        }),
    

    removeListInfo: (listId) =>
        set((state) => {
            const { [listId]: _, ...rest } = state.listTaskInfo
            return { listTaskInfo: rest }
        }),

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

    removeFilterInfo: (filterId) =>
        set((state) => {
            const { [filterId]: _, ...rest } = state.filterInfo
            return { filterInfo: rest }
        }),

    hydrate: (data) => {
        set(() => ({
            inboxCount: data.inboxCount ?? 0,
            todayCount: data.todayCount ?? 0,
            nextDayCount: data.nextDayCount ?? 0,
            inbox:data.inbox??null,
            listTaskInfo: Object.fromEntries(
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
    return Object.values(get().listTaskInfo)
        .map((item) => item.list)
        .filter((list) => list.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()));
},
    reset: () => set(() => ({ ...initialState })),
}))