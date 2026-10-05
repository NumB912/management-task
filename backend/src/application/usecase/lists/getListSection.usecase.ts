import { IUsecase, IListRepository, AppError } from "@/domain";
import { IList } from "@/domain/entities/list.entity";

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
                throw new AppError("NOT_FOUND", "KhÃ´ng cÃ³ ngÆ°á»i dÃ¹ng", 404)
            }
            const listAndSections = await this.listRepository.getListAndSection({
                userId: data.user_id
            })
            return listAndSections;
        } catch (error) {
            console.error(error)
            throw new AppError("Error", "Lá»—i thá»±c thi", 500)
        }
    }
}
