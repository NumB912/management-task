import { IUsecase, IListRepository, AppError } from "@/app/core/domain";
import { IList, IListWithId } from "@/app/core/domain/entities/list.entities";

export class GetAllListUsecase implements IUsecase<Partial<IList>[]> {
  constructor(private readonly listRepository: IListRepository) { }
  async execute(
    data: { user_id: string }
  ): Promise<
    Partial<IList>[]
  > {
    try {
      if (!data.user_id) {
        throw new AppError("NOT_FOUND", "Không có người dùng", 404)
      }
      const lists = await this.listRepository.findListByUser(data.user_id)

      console.log(lists)
      return lists ?? [];
    } catch (error) {
      console.error(error)
      throw new AppError("Error", "Lỗi thực thi", 500)
    }
  }
}
