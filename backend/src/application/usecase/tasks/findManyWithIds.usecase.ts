import { TaskDetailByIdsCache } from '@/application/service/taskByIdsCache.service';
import {
  IUsecase,
  ITask,
  ITaskRepository,
  AppError,
  ITaskWithId,
} from '@/domain';
export class GetAllTasksWithIdsUsecase implements IUsecase<
  Pick<Partial<ITaskWithId>, 'id' | 'name'>[] | null
> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly taskCache: TaskDetailByIdsCache,
  ) {}
  async execute(DTO: {
    userId: string;
    listId: string;
    taskIds: string[];
  }): Promise<ITask[]> {
    try {
      const { listId, taskIds, userId } = DTO;
      return this.taskCache.load(
        taskIds,
        { userId, listId },
        (missingIds: string[]) =>
          this.taskRepository.findTasksByIds({
            ids: missingIds,
            list: listId,
            user: userId,
          }),
      );
    } catch (error) {
      console.error(error);
      throw new AppError(
        'ERROR',
        'Lỗi trong quá trình lấy danh sách task',
        500,
      );
    }
  }
}
