import {
  IUsecase,
  ITaskRepository,
  AppError,
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

  private async getRecipientIds(
    list: { isShareList?: boolean; members?: any[] },
    userId: string,
    session: unknown,
  ): Promise<string[]> {
    if (!list.isShareList) return [];
    const members = await this.MemberRepository.findManyByIds(
      list.members ?? [],
      session,
    );
    return members.map((m) => String(m.user)).filter((u) => u !== String(userId));
  }

  async execute(DTO: {
    id: string;
    data: Partial<Omit<ITask, "id" | "status" | "done_at">>;
    userId: string;
  }): Promise<void> {
    const { data, id, userId } = DTO;
    if (!id || !data) {
      throw new AppError("BAD_REQUEST", "Thiếu id hoặc dữ liệu cập nhật", 400);
    }

    let notify: (() => Promise<void>) | undefined;

    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();

      const taskCur = await this.TaskRepository.findByIdPopulate(id, session);
      if (!taskCur) {
        throw new AppError("NOT_FOUND", "Không tìm thấy task để cập nhật", 404);
      }

      const oldList = await this.ListRepository.findById(taskCur.list, session);
      if (!oldList) {
        throw new AppError("NOT_FOUND", "Không tìm thấy dữ liệu", 404);
      }
      // TODO: kiểm tra userId có quyền trên oldList

      const patch = {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      };
      if (Object.keys(patch).length) {
        await this.TaskRepository.update(id, patch, session);
      }

      const isListChanged =
        data.list !== undefined && String(data.list) !== String(taskCur.list);
      const isSectionChanged =
        data.section !== undefined &&
        String(data.section) !== String(taskCur.section);

      if (data.rule) {
        const rulePayload = {
          ...data.rule,
          ...(isListChanged ? { list: data.list } : undefined),
        };
        await this.UpdateRuleUsecase.run(id, rulePayload, userId, session);
      }

      if (isListChanged || isSectionChanged) {
        await this.MoveToSectionUsecase.run(
          {
            taskId: id,
            listId: String(data.list ?? taskCur.list),
            sectionId: data.section,
          },
          session,
        );
      }

      const updated = await this.TaskRepository.findByIdPopulate(id, session);

      const newList = isListChanged
        ? await this.ListRepository.findById(data.list!, session)
        : oldList;
      if (!newList) {
        throw new AppError("NOT_FOUND", "Không tìm thấy list đích", 404);
      }
      const newIds = await this.getRecipientIds(newList, userId, session);
      const oldIds = isListChanged
        ? await this.getRecipientIds(oldList, userId, session)
        : [];
      const removedIds = oldIds.filter((u) => !newIds.includes(u));
      notify = async () => {
        if (newIds.length) {
          await this.publisher.pub("Task.exchange", "Task.update", "direct", {
            userIds: newIds,
            data: { ...updated, id },
            event: "task-update",
          });
        }
        if (removedIds.length) {
          await this.publisher.pub("Task.exchange", "Task.delete", "direct", {
            userIds: removedIds,
            data: { id },
            event: "task-delete",
          });
        }
      };

      await this.unitWork.commitTransaction();
    } catch (error: any) {
      console.error(error);
      await this.unitWork.rollBackTransaction();
      if (error instanceof AppError) throw error;
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình cập nhật task",
        error.status ?? 500,
      );
    }
    try {
      await notify?.();
    } catch (err) {
      console.error("Publish task-update thất bại:", err);
    }
  }
}