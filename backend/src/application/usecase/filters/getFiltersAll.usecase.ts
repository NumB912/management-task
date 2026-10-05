import { IUsecase, IFilterRepository, AppError } from "@/domain";
import { IFilterWithId } from "@/domain/entities/filter.entity";

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
      throw new AppError("ERROR", "Lá»—i trong quÃ¡ trÃ¬nh láº¥y danh sÃ¡ch filter", 500);
    }
  }
}
