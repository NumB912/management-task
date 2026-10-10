import {
  IUsecase,
  ITask,
  ITaskRepository,
  AppError,
  ITaskWithId,
  IUnitWork,
} from '@/domain';
export class GetAllTasksWithIdsUsecase implements IUsecase<
  Pick<Partial<ITaskWithId>, 'id' | 'name'>[] | null
> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly unitWork: IUnitWork,
  ) {}
  async execute(
    DTO:{
    userId: string,
    listId: string,
    taskIds: string[],
    }
  ): Promise<ITask[]> {
    try {
        const {listId,taskIds,userId} = DTO
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();

      const task = await this.taskRepository.findTasksByIds(
        {
          ids: taskIds,
          list: listId,
          user: userId,
        },
        session,
      );

      await this.unitWork.commitTransaction();
      return task;
    } catch (error) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      throw new AppError(
        'ERROR',
        'Lỗi trong quá trình lấy danh sách task',
        500,
      );
    }
  }
}
