import {
  IUsecase,
  ITaskRepository,
  AppError,
  ITaskWithId,
  ITask,
  IListRepository,
  IPublisher,
} from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { UpdateRuleUsecase } from "./updateRule.usecase";
import { MoveToSectionUsecase } from "./moveToSection.usecase";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";

export class UpdateTaskUsecase implements IUsecase<void> {
  constructor(
    private readonly TaskRepository: ITaskRepository,
    private readonly UpdateRuleUsecase: UpdateRuleUsecase,
    private readonly MoveToSectionUsecase: MoveToSectionUsecase,
    private readonly ListRepository: IListRepository,
    private readonly MemberRepository: IMemberRepository,
    private readonly publisher: IPublisher,
    private readonly unitWork: IUnitWork,
  ) {}

  async execute(DTO: {
    id: string;
    data: Partial<Omit<ITask, "id" | "status" | "done_at">>;
    userId: string;
  }): Promise<void> {
    const { data, id, userId } = DTO;

    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      if (!id || !data)
        throw new AppError("NOT_FOUND", "Không tìm thấy task", 404);
      const taskCur = await this.TaskRepository.findById(id, session);
      if (!taskCur) {
        throw new AppError("NOT_FOUND", "Không tìm thấy task để cập nhật", 404);
      }

      const list = await this.ListRepository.findById(taskCur.list, session);

      if (!list) {
        throw new AppError("NOT_FOUND", "Không tìm thấy dữ liệu", 404);
      }

    const patch = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    };
    if (Object.keys(patch).length) {
      await this.TaskRepository.update(id, patch, session);
    }

      const isListChanged =
        data.list !== undefined && data.list !== taskCur.list;
      const isSectionChanged =
        data.section !== undefined && data.section !== taskCur.section;
      if (data.rule || isListChanged) {
        const rulePayload = {
          ...data.rule,
          ...(isListChanged ? { list: data.list } : {}),
        };
        await this.UpdateRuleUsecase.run(id, rulePayload, userId,session);
      }
      if (isListChanged || isSectionChanged) {
        await this.MoveToSectionUsecase.run(
          {
            taskId: id,
            listId: data.list ?? taskCur.list,
            sectionId: data.section,
          },
          session,
        )
      }
      console.log("helllo",list.isShareList)
      if(list.isShareList){
        const members = await this.MemberRepository.findManyByIds(list.members,session)
        const users = members.map((member) => member.user).filter((user) => user != userId)
        await this.publisher.pub(
          "Task.exchange",
          "Task.update",
          "direct",
          {
            userIds:users,
            data:{
              ...data,
              id:id,
            },
            event:"task-update"
          }
        );
      }

      await this.unitWork.commitTransaction();
    } catch (error: any) {
      console.log(error);
      await this.unitWork.rollBackTransaction();
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình cập nhật task",
        error.status ?? 500,
      );
    }
  }
}
