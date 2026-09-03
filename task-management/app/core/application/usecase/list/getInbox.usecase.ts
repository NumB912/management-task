import { IUsecase, IListRepository, AppError } from "@/app/core/domain";
import { IList } from "@/app/core/domain/entities/list.entities";

export class GetInboxUsecase implements IUsecase<IList|null> {
  constructor(private readonly listRepository: IListRepository) { }
  async execute(
    data: { user_id: string }
  ): Promise<
    IList|null
  > {
    try {
      if (!data.user_id) {
        throw new AppError("NOT_FOUND", "Không có người dùng", 404)
      }
      const list= await this.listRepository.getInbox({userId:data.user_id})
      return list;
    } catch (error) {
      console.error(error)
      throw new AppError("Error", "Lỗi thực thi", 500)
    }
  }
}
