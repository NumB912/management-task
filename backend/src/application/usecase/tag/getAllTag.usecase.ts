import { IUsecase, ITagRepository, AppError } from "@/domain";
import { ITagWithId } from "@/domain/entities/tag.entity";

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
      throw new AppError("ERROR", "Lá»—i trong quÃ¡ trÃ¬nh láº¥y danh sÃ¡ch tag", 500);
    }
  }
}
