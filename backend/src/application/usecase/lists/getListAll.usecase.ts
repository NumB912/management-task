import { IUsecase, IListRepository, AppError } from "@/domain";
import { IList, IListWithId } from "@/domain/entities/list.entity";

export class GetAllListUsecase implements IUsecase<Partial<IList>[]> {
  constructor(private readonly listRepository: IListRepository) { }
  async execute(
    data: { user_id: string }
  ): Promise<
    Partial<IList>[]
  > {
    try {
      if (!data.user_id) {
        throw new AppError("NOT_FOUND", "KhÃ´ng cÃ³ ngÆ°á»i dÃ¹ng", 404)
      }
      const lists = await this.listRepository.findListByUser(data.user_id)
      return lists ?? [];
    } catch (error) {
      console.error(error)
      throw new AppError("Error", "Lá»—i thá»±c thi", 500)
    }
  }
}
