import {
  IUsecase,
  ITaskRepository,
  AppError,
  ITask,
  IListRepository,
  IPublisher,
} from "@/domain";
import { IUnitWork } from "@/domain/entities/unitwork.entity";
import { UpdateRuleUsecase, MoveToSectionUsecase } from "./index";
import { IMemberRepository } from "@/domain/repositories/IMember.repository";

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
      throw new AppError("BAD_REQUEST", "Thiáº¿u id hoáº·c dá»¯ liá»‡u cáº­p nháº­t", 400);
    }

    let notify: (() => Promise<void>) | undefined;

    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();

      const taskCur = await this.TaskRepository.findByIdPopulate(id, session);
      if (!taskCur) {
        throw new AppError("NOT_FOUND", "KhÃ´ng tÃ¬m tháº¥y task Ä‘á»ƒ cáº­p nháº­t", 404);
      }

      const oldList = await this.ListRepository.findById(taskCur.list, session);
      if (!oldList) {
        throw new AppError("NOT_FOUND", "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u", 404);
      }
      // TODO: kiá»ƒm tra userId cÃ³ quyá»n trÃªn oldList

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
        throw new AppError("NOT_FOUND", "KhÃ´ng tÃ¬m tháº¥y list Ä‘Ã­ch", 404);
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
        error.message ?? "Lá»—i trong quÃ¡ trÃ¬nh cáº­p nháº­t task",
        error.status ?? 500,
      );
    }
    try {
      await notify?.();
    } catch (err) {
      console.error("Publish task-update tháº¥t báº¡i:", err);
    }
  }
}
