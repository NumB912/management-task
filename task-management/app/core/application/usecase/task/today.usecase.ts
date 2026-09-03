import { IUsecase, AppError, ITaskRepository, ITask, ITaskPartial } from "@/app/core/domain";

export class GetTodayUsecase implements IUsecase<{
  today: Partial<ITaskPartial>[]
  overDue: Partial<ITaskPartial>[]
}> {
  constructor(private readonly taskRepository: ITaskRepository) { }
  async execute(
    data: { user_id: string }
  ): Promise<
    {
      today: Partial<ITaskPartial>[]
      overDue: Partial<ITaskPartial>[]
    }
  > {
    try {
      if (!data.user_id) {
        throw new AppError("NOT_FOUND", "Không có người dùng", 404)
      }
      const today = await this.taskRepository.getToday(data.user_id)
      const overDue = await this.taskRepository.getOverdue(data.user_id)
      return {
        overDue: overDue,
        today: today
      };
    } catch (error) {
      console.error(error)
      throw new AppError("Error", "Lỗi thực thi", 500)
    }
  }
}
