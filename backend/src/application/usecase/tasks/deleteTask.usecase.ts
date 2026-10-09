import {
  IUsecase,
  ITaskRepository,
  AppError,
  IRuleRepository,
  ISectionRepository,
  IPublisher,
  IListRepository,
  IUserRepository,
} from "@/domain";
import { IUnitWork } from "@/domain/entities/unitwork.entity";
import { ITaskWithId } from "@/domain/entities/task.entity";
import { IMemberRepository } from "@/domain/repositories/IMember.repository";

export class DeleteTaskUsecase implements IUsecase<ITaskWithId | null> {
  constructor(
    private readonly TaskRepository: ITaskRepository,
    private readonly RuleRepository: IRuleRepository,
    private readonly SectionRepository: ISectionRepository,
    private readonly ListRepository: IListRepository,
    private readonly MemberRepository: IMemberRepository,
    private readonly publisher: IPublisher,
    private readonly unitWork: IUnitWork,
  ) {}
  async execute(id: string, userId: string): Promise<ITaskWithId | null> {
    if (!id) {
      throw new AppError("NOT_FOUND", "KhÃ´ng tÃ¬m tháº¥y task", 404);
    }
    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      const task = await this.TaskRepository.findById(id, session);
      if (!task) {
        throw new AppError("NOT_FOUND", "KhÃ´ng tÃ¬m tháº¥y task", 404);
      }

      const list = await this.ListRepository.findById(task.list, session);

      if (!list) {
        throw new AppError("NOT FOUND", "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u", 400);
      }
      const deleteTask = await this.TaskRepository.delete(id, session);
      if (!deleteTask) {
        throw new AppError("NOT FOUND", "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u", 400);
      }

      await this.RuleRepository.deleteBy({ id: task.rule }, session);

      if(task.section){
        await this.SectionRepository.pullTaskFromSection({
        id: task.section,
        tasks: [id],
      
      },session);
      }

      if (list?.isShareList) {
        const members = await this.MemberRepository.findManyByIds(
          list.members,
          session,
        );
        const users = members
          .map((member) => member.user)
          .filter((user) => user != userId);
        await this.publisher.pub("Task.exchange", "Task.delete", "direct", {
          data: {
            id: id,
          },
          userIds: users,
          event: "task-delete",
        });
      }

      await this.unitWork.commitTransaction();
      return task;
    } catch (error: any) {
      console.error(error);
      await this.unitWork.rollBackTransaction();
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lá»—i trong quÃ¡ trÃ¬nh táº¡o section",
        error.status ?? 500,
      );
    }
  }
}
