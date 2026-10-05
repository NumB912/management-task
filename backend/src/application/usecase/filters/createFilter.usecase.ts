import { IUsecase, AppError, IFilterRepository, IFilterWithId, ITagRepository, IQueryFilterParserService } from "@/domain";

export class CreateFilterUsecase implements IUsecase<Partial<IFilterWithId> | null> {
  constructor(private readonly filterRepository: IFilterRepository, private readonly tagRepository: ITagRepository,private readonly queryFilterService:IQueryFilterParserService) { }
  async execute(
    DTO: {
      data: Omit<IFilterWithId, "id" | "created_at" | "updated_at"|"user">,
      user_id: string
    }
  ): Promise<Partial<IFilterWithId> | null> {
    try {
      const { data, user_id } = DTO
      const isExistName = await this.filterRepository.findOne({ name: data.name, user: user_id });
      if (isExistName) {
        throw new AppError(
          "CONFLICT",
          "TrÃ¹ng tÃªn vá»›i Filter khÃ¡c vui lÃ²ng dÃ¹ng tÃªn khÃ¡c",
          401,
        );
      }

      const createFilter = await this.filterRepository.create(
        {
          ...data,
          user: user_id,
          created_at:new Date()
        }
      );

      return createFilter;
    } catch (error) {
      console.error(error);
      throw new AppError("ERROR", "Lá»—i trong quÃ¡ trÃ¬nh táº¡o filter", 500);
    }
  }
}
