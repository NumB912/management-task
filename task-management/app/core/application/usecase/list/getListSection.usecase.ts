import { IUsecase, IListRepository, AppError } from "@/app/core/domain";
import { IList } from "@/app/core/domain/entities/list.entities";

export class GetAllListSectionUsecase implements IUsecase<{
    lists: Pick<IList, "id" | "name" | "sections">[]
}> {
    constructor(private readonly listRepository: IListRepository) { }
    async execute(
        data: { user_id: string }
    ): Promise<
        {
            lists: Pick<IList, "id" | "name" | "sections">[]
        }
    > {
        try {

            if (!data.user_id) {
                throw new AppError("NOT_FOUND", "Không có người dùng", 404)
            }
            const listAndSections = await this.listRepository.getListAndSection({
                userId: data.user_id
            })
            return listAndSections;
        } catch (error) {
            console.error(error)
            throw new AppError("Error", "Lỗi thực thi", 500)
        }
    }
}
