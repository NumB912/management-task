import { IUsecase, AppError, ITaskRepository, ITaskPartial } from "@/app/core/domain";

export class GetUpcomingUsecase implements IUsecase<{
    upComming: Partial<ITaskPartial>[],
    overDue:Partial<ITaskPartial>[]
  }> {
  constructor(private readonly taskRepository: ITaskRepository) { }
  async execute(
    data: { user_id: string; limit?: number }
  ): Promise<{
    upComming: Partial<ITaskPartial>[],
    overDue:Partial<ITaskPartial>[]
  }> {
    try {
      if (!data.user_id) {
        throw new AppError("NOT_FOUND", "Không có người dùng", 404)
      }
      const upcoming = await this.taskRepository.upComming(data.user_id)
      const getOverDue = await this.taskRepository.getOverdue(data.user_id)
      return {
        overDue:getOverDue,
        upComming:upcoming
      }
      ;
    } catch (error) {
      console.error(error)
      throw new AppError("Error", "Lỗi thực thi", 500)
    }
  }
}