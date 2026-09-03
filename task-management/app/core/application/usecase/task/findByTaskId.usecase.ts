import { IUsecase, ITaskRepository, ITask, AppError } from "@/app/core/domain";
export class GetTaskByIdUsecase implements IUsecase<Partial<ITask> | null> {
  constructor(private readonly repositories: ITaskRepository) {}
  async execute(id: string): Promise<Partial<ITask> | null> {
    try {
      const taskById = await this.repositories.findByIdPopulate(id);
      return taskById;
    } catch (error) {
      console.error(error);
      throw new AppError("ERROR", "Lỗi trong quá trình lấy task", 500);
    }
  }
}
