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

interface WorkSpaceResult {
    tags: Partial<ITagWithId>[];
    lists: IList[];
    filters: Partial<IFilter>[];
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
                lists: listData.lists ?? [],
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