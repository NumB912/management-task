import {
    IUsecase,
    AppError,
    IListRepository,
    ITagRepository,
    ITagWithId,
    IFilterRepository,
    IFilter,
    IList,
} from "@/app/core/domain";

interface WorkSpaceDTO {
    userId: string;
}

interface ListWithTaskCount {
    list: IList;
    taskCount: number;
}

interface OnlyCount extends Omit<ListWithTaskCount,"list">{}

interface WorkSpaceResult {
    tags: Partial<ITagWithId>[];
    lists: ListWithTaskCount[];
    filters: Partial<IFilter>[];
    inbox: OnlyCount | null;
    today: OnlyCount[];
    next7Days: OnlyCount[];
}

export class WorkSpaceUsecase implements IUsecase<WorkSpaceResult> {
    constructor(
        private readonly TagRepostitory: ITagRepository,
        private readonly ListRepository: IListRepository,
        private readonly FilterRepositoy: IFilterRepository,
    ) {}

    async execute(DTO: WorkSpaceDTO): Promise<WorkSpaceResult> {
        try {
            const { userId } = DTO;
            const [listData, tags, filters] = await Promise.all([
                this.ListRepository.getListAll(userId),
                this.TagRepostitory.findMany({ filter: { user: userId } }),
                this.FilterRepositoy.findMany({ filter: { user: userId } }),
            ]);
            return {
                lists: listData?.lists ?? [],
                inbox: listData?.inbox ?? null,
                today: listData?.today ?? [],
                next7Days: listData?.next7Days ?? [],
                tags: tags ?? [],
                filters: filters ?? [],
            };
        } catch (error: any) {
            console.error(error);
            throw new AppError(
                error.code ?? "INTERNAL_SERVER",
                error.message ?? "Lỗi trong quá trình lấy dữ liệu workspace",
                error.status ?? 500,
            );
        }
    }
}