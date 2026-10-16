import { IUsecase, ITaskRepository, ITask, AppError } from "@/domain";
import { TaskDetailCache } from '../../service/taskDetailCache.service.js';
export class GetTaskByIdUsecase implements IUsecase<Partial<ITask> | null> {
  constructor(private readonly repositories: ITaskRepository, private readonly cache: TaskDetailCache) {}
  async execute(id: string): Promise<Partial<ITask> | null> {
    try {
      const taskById = await this.cache.load(id, () => this.repositories.findByIdPopulate(id));
      return taskById;
    } catch (error) {
      console.error(error);
      throw new AppError("ERROR", "Lá»—i trong quÃ¡ trÃ¬nh láº¥y task", 500);
    }
  }
}
