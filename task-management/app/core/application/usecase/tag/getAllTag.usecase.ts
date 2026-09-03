import { IUsecase, ITagRepository, AppError } from "@/app/core/domain";
import { ITagWithId } from "@/app/core/domain/entities/tag.entities";

export class GetAllTagsUsecase implements IUsecase<
  Partial<ITagWithId>[]
> {
  constructor(private readonly repositories: ITagRepository) { }
  async execute(user_id: string): Promise<Partial<ITagWithId>[]> {
    try {
      const list = await this.repositories.findMany({
        filter: {
          user: user_id
        }
      });
      return list;
    } catch (error) {
      console.error(error);
      throw new AppError("ERROR", "Lỗi trong quá trình lấy danh sách tag", 500);
    }
  }
}
