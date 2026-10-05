import { IUsecase, IListRepository, AppError } from "@/domain";
import { IList } from "@/domain/entities/list.entity";

export class GetInboxUsecase implements IUsecase<IList|null> {
  constructor(private readonly listRepository: IListRepository) { }
  async execute(
    data: { user_id: string }
  ): Promise<
    IList|null
  > {
    try {
      if (!data.user_id) {
        throw new AppError("NOT_FOUND", "KhÃ´ng cÃ³ ngÆ°á»i dÃ¹ng", 404)
      }
      const list= await this.listRepository.getInbox({userId:data.user_id})
      return list;
    } catch (error) {
      console.error(error)
      throw new AppError("Error", "Lá»—i thá»±c thi", 500)
    }
  }
}
