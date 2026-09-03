import {
  IUsecase,
  ITaskRepository,
  AppError,
  ITaskWithId,
  ITask,
} from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { UpdateRuleUsecase } from "./updateRule.usecase";
import { MoveToSectionUsecase } from "./moveToSection.usecase";

export class UpdateTaskUsecase implements IUsecase<Partial<ITaskWithId> | null> {
  constructor(
    private readonly TaskRepository: ITaskRepository,
    private readonly UpdateRuleUsecase: UpdateRuleUsecase,
    private readonly MoveToSectionUsecase: MoveToSectionUsecase,
    private readonly unitWork: IUnitWork,
  ) { }

  async execute(
    DTO: {
      id: string;
      data: Partial<Omit<ITask, "id" | "status" | "done_at">>;
      userId: string;
    },
  ): Promise<Partial<ITaskWithId> | null> {
    const { data, id, userId } = DTO;
    if (!id || !data)
      throw new AppError("NOT_FOUND", "Không tìm thấy task", 404);
    const taskCur = await this.TaskRepository.findById(id);
    if (!taskCur) {
      throw new AppError("NOT_FOUND", "Không tìm thấy task để cập nhật", 404);
    }
    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();

      const update = await this.TaskRepository.update(
        id,
        {
          name: data.name,
          description: data.description,
        },
        session,
      );
      const isListChanged =
        data.list !== undefined && data.list !== taskCur.list;
      const isSectionChanged =
        data.section !== undefined && data.section !== taskCur.section;

      if (data.rule || isListChanged) {
        const rulePayload = {
          ...data.rule,
          ...(isListChanged ? { list: data.list } : {}),
        };

        await this.UpdateRuleUsecase.execute(id, rulePayload, userId);
      }

      if (isListChanged || isSectionChanged) {
        await this.MoveToSectionUsecase.run(
          {
            taskId: id,
            listId: data.list ?? taskCur.list,
            sectionId: data.section,
          },
          session, 
        );
      }

      await this.unitWork.commitTransaction();
      return update;
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
