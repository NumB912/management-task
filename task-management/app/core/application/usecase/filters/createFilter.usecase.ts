import { IUsecase, AppError, IFilterRepository, IFilterWithId, ITagRepository, IQueryFilterParserService } from "@/app/core/domain";

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
          "Trùng tên với Filter khác vui lòng dùng tên khác",
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
      throw new AppError("ERROR", "Lỗi trong quá trình tạo filter", 500);
    }
  }
}
