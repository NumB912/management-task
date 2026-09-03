import { IUsecase, ITagRepository, ITagWithId, AppError, ITask, ITaskRepository, ITaskPartial } from "@/app/core/domain";

export class GetTagByIdUsecase implements IUsecase<{
  tag: Partial<ITagWithId>,
  tasks: Partial<ITaskPartial>[]
}|null> {
  constructor(private readonly tagRepsoitory: ITagRepository,private readonly taskRepository:ITaskRepository) { }
  async execute(DTO: {
    id: string, userId: string
  }): Promise<{
    tag: Partial<ITagWithId>,
    tasks: Partial<ITaskPartial>[]
  }|null> {
    try {
      const { id, userId } = DTO
      const getTag = await this.tagRepsoitory.findOne({
        id:id,
        user:userId
      })
      if (!getTag) {
        throw new AppError("NOT_FOUND", "Không tìm thấy dữ liệu", 404)
      }
      const tasks = await this.taskRepository.findTasksByTagForUser({
        tagName:getTag.name,
        userId:userId
      })
      return {
        tag:getTag,
        tasks:tasks,
      };
    } catch (error) {
      console.error(error);
      throw new AppError("ERROR", "Lỗi trong quá trình lấy tag", 500);
    }
  }
}
