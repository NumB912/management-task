import { IUsecase, IFilterRepository, AppError } from "@/app/core/domain";
import { IFilterWithId } from "@/app/core/domain/entities/filter.entities";

export class GetAllFiltersUsecase implements IUsecase<
  Pick<IFilterWithId, "id" | "name">[]
> {
  constructor(
    private readonly filterRepository: IFilterRepository
  ) {}
  async execute(
    user_id:string
  ): Promise<Pick<IFilterWithId, "id" | "name">[]> {
    try {
      const filters =await this.filterRepository.findMany({
        filter:{
          user:user_id
        }
      });

    
      return filters.map((filter)=>{
        return {
          id:filter.id!,
          name:filter.name!
        }
      });
    } catch (error) {
      console.error(error);
      throw new AppError("ERROR", "Lỗi trong quá trình lấy danh sách filter", 500);
    }
  }
}
