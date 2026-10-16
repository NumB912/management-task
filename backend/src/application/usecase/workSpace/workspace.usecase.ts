import {
    IUsecase,
    AppError,
    IListRepository,
    ITagRepository,
    ITagWithId,
    IFilterRepository,
    IFilter,
    IList,
    IColorRepository,
    IColor,
    INotification,
} from "@/domain";
import { INotificationRepository } from "@/domain/repositories/INotification.repository";
import { no } from "zod/locales";

interface WorkSpaceDTO {
    userId: string;
}

export interface WorkSpaceResult {
    tags: Partial<ITagWithId>[];
    lists: IList[];
    filters: Partial<IFilter>[];
    colors:Partial<IColor>[];
    notifications:Partial<INotification>[]
}

export class WorkSpaceUsecase implements IUsecase<WorkSpaceResult> {
    constructor(
        private readonly TagRepostitory: ITagRepository,
        private readonly ListRepository: IListRepository,
        private readonly FilterRepositoy: IFilterRepository,
        private readonly ColorRepository:IColorRepository,
        private readonly NotificationRepository:INotificationRepository,
    ) {}

    async execute(DTO: WorkSpaceDTO): Promise<WorkSpaceResult> {
        try {
            const { userId } = DTO;
            const [listData, tags, filters,colors,notifications] = await Promise.all([
                this.ListRepository.getListAll(userId),
                this.TagRepostitory.findMany({ filter: { user: userId } }),
                this.FilterRepositoy.findMany({ filter: { user: userId } }),
                this.ColorRepository.findMany({filter:{user:userId}}),
                this.NotificationRepository.getNotificationByUser({userId})
            ]);

            return {
                lists: (listData.lists ?? []).map((list) => ({
                    ...list,
                    color: colors?.find((color) => color.type === "list" && color.refId === list.id)?.color ?? list.color ?? "#3B82F6",
                })),
                tags: tags ?? [],
                filters: filters ?? [],
                colors:colors??[],
                notifications:notifications??[]
            };
        } catch (error: any) {
            console.error(error);
            throw new AppError(
                error.code ?? "INTERNAL_SERVER",
                error.message ?? "Lá»—i trong quÃ¡ trÃ¬nh láº¥y dá»¯ liá»‡u workspace",
                error.status ?? 500,
            );
        }
    }
}
