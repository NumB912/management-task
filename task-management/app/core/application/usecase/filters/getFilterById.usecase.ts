import { IUsecase, IFilterRepository, IFilterWithId, AppError, ITaskRepository, ITaskWithId, ITaskPartial } from "@/app/core/domain";

export class GetFilterByIdUsecase implements IUsecase<{
    filter:IFilterWithId|null,
    tasks:Partial<ITaskPartial>[]
  }> {
  constructor(private readonly filterRepository:IFilterRepository,private readonly taskRepository:ITaskRepository){}

  async execute(DTO:{
    userId:string,
    id: string
  }): Promise<{
    filter:IFilterWithId|null,
    tasks:Partial<ITaskPartial>[]
  }> {
    try {
      const {userId,id} = DTO
      const filter =await this.filterRepository.findById(id);
      if(!filter){
        return {
          filter:null,
          tasks:[]
        }
      }
      const tasks = await this.taskRepository.findTasksByFilter({
        filter: {
          priority: filter.priority,
          specials: filter.specials,
          status: filter.status,
          tagNames: filter.tags,
          endDate: filter.end_date,
          startDate: filter.start_date,
        },
        userId: userId
      })
      
      return {
        filter:filter,
        tasks:tasks
      };
    } catch (error) {
      console.error(error);
      throw new AppError("ERROR", "Lỗi trong quá trình lấy filter", 500);
    }
  }
  
}
