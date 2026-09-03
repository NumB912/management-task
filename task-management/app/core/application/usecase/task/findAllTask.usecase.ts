import { IUsecase, ITask, ITaskRepository, AppError, ITaskWithId } from "@/app/core/domain";
import { DomainFilter } from "@/app/core/domain/repositories/IRepositories";
export class GetAllTasksUsecase implements IUsecase<Pick<Partial<ITaskWithId>, "id" | "name">[] | null> {
  constructor(private readonly taskRepository: ITaskRepository) { }
  async execute(
    filter?: DomainFilter<ITask>,
  ): Promise<
    Pick<Partial<ITaskWithId>, "id" | "name">[] | null
  > {
    try {
      const task = await this.taskRepository.findMany({
        filter: {
          section: filter?.section,
          list:filter?.list
        }
      });
      return task;
    } catch (error) {
      console.error(error);
      throw new AppError("ERROR", "Lỗi trong quá trình lấy danh sách task", 500);
    }
  }
}
