import {
  IUsecase,
  AppError,
  ICaculateDeadLine,
  IRuleRepository,
  ITaskRepository,
  ISectionRepository,
  IRule,
  IStatusTask,
  ITaskWithId,
  IPublisher,
  IListRepository,
} from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";
import { GenerateId } from "@/app/core/domain/services/generateID.service";
import { use } from "react";

interface IUpdateStatusDTO {
  taskId: string;
  data: PayloadUpdateStatus;
  userId: string;
}

interface PayloadUpdateStatus {
  status: IStatusTask;
  id: string;
  record: Record<
    string,
    {
      date: Date;
      rule: string;
    }
  >;
}

export class UpdateStatusUsecase implements IUsecase<void> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly calcService: ICaculateDeadLine,
    private readonly ruleRepository: IRuleRepository,
    private readonly sectionRepository: ISectionRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly listRepository: IListRepository,
    private readonly publisher: IPublisher,
    private readonly unitWork: IUnitWork,
  ) {}

  private async getRecipientIds(
    list: { isShareList?: boolean; members?: any[] },
    userId: string,
    session: unknown,
  ): Promise<string[]> {
    if (!list.isShareList) return [];
    const members = await this.memberRepository.findManyByIds(
      list.members ?? [],
      session,
    );
    return members
      .map((m) => String(m.user))
      .filter((u) => u !== String(userId));
  }

  private getUntilEnd(rule?: IRule | null): Date | null {
    const raw = rule?.repeat?.until;
    if (!raw) return null;
    const until = new Date(raw);
    if (Number.isNaN(until.getTime())) return null;
    until.setHours(23, 59, 59, 999);
    return until;
  }

  private nextAfter(
    rule: IRule,
    from: Date,
  ): { next: Date | null; isEnded: boolean } {
    const until = this.getUntilEnd(rule);
    const next = this.calcService.getModeCaculateDeadLine(rule, from);
    const isEnded = !next || (!!until && next.getTime() > until.getTime());
    return { next: next, isEnded };
  }
  async execute(DTO: IUpdateStatusDTO): Promise<void> {
    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();

      const { data, taskId } = DTO;
      if (!taskId || !data) {
        throw new AppError("BAD_REQUEST", "Thiếu taskId hoặc dữ liệu", 400);
      }
      const entries = Object.entries(data.record ?? {}).map(
        ([tempId, value]) => {
          const date = new Date(value.date);
          const rule = value.rule;
          if (Number.isNaN(date.getTime())) {
            throw new AppError(
              "BAD_REQUEST",
              `Ngày không hợp lệ cho ${tempId}`,
              400,
            );
          }
          return { tempId, date, rule };
        },
      );
      if (entries.length > 50) {
        throw new AppError("BAD_REQUEST", `Tối đa ${50} lần lặp mỗi lần`, 400);
      }
      const taskCur = await this.taskRepository.findByIdPopulate(
        taskId,
        session,
      );
      if (!taskCur) {
        throw new AppError("NOT_FOUND", "Không tìm thấy task để cập nhật", 404);
      }
      const rule = taskCur.rule;
      const isRecurring =
        !!rule &&
        rule.repeat?.mode !== undefined &&
        rule.repeat.mode !== "none";
      if (
        (!isRecurring && data.status === "pending") ||
        entries?.length === 0
      ) {
        const updated = await this.taskRepository.update(
          taskId,
          {
            status: data.status,
            done_at: data.status === "pending" ? undefined : new Date(),
          },
          session,
        );
        if (!updated) {
          throw new AppError(
            "NOT_FOUND",
            "Không tìm thấy task để cập nhật",
            404,
          );
        }
        const list = await this.listRepository.findById(
          taskCur?.list,
          session,
        );
  
        if (list?.isShareList) {
          const ids = await this.getRecipientIds(list, DTO.userId, session);
          this.publisher.pub("Task.exchange", "Task.update.status", "direct", {
            userIds: ids,
            data: {
              status: data.status,
              id: taskCur.id,
              type: "single",
            },
            event: "task-update-status",
          });
        }

        await this.unitWork.commitTransaction();
        return;
      }
      const lastest = Math.max(...entries.map((value) => value.date.getTime()));
      const { isEnded, next } = this.nextAfter(rule!, new Date(lastest));
      const { id: _taskId, rule: _rule, ...taskBase } = taskCur as any;
      const { id: _ruleId, ...ruleBase } = rule as any;
      const untilEnd = this.getUntilEnd(rule);
      const pairs = entries
        .filter((e) => !untilEnd || e.date.getTime() <= untilEnd.getTime())
        .map((value) => {
          return {
            taskId: value.tempId,
            ruleId: value.rule,
            date: value.date,
          };
        });

      const toCreateRule: IRule[] = pairs.map((value) => {
        return {
          ...ruleBase,
          repeat: {
            mode: "none",
          },
          start_date: value.date,
          id: value.ruleId,
          task: value.taskId,
        };
      });

      const toCreateTasks: ITaskWithId[] = pairs.map((value) => {
        return {
          ...taskBase,
          id: value.taskId,
          rule: value.ruleId,
          done_at: new Date(),
          status: data.status,
        };
      });
      const createTaskMany = await this.taskRepository.createMany(
        toCreateTasks,
        session,
      );
      await this.ruleRepository.createMany(toCreateRule, session);
      await this.sectionRepository.pushTaskIntoSection({
        id: String(taskCur.section),
        tasks: createTaskMany.map((it) => it.id),
        session,
      });

      if (isEnded) {
        await this.taskRepository.update(
          taskId,
          { status: data.status, done_at: new Date() },
          session,
        );
        await this.ruleRepository.update(
          rule!.id,
          {
            repeat: {
              mode: "none",
              dates: [],
              days: [],
              every: undefined,
              specificDays: [],
            },
          },
          session,
        );
      } else {
        await this.taskRepository.update(
          taskId,
          { status: "pending", done_at: undefined },
          session,
        );
        await this.ruleRepository.update(
          rule!.id,
          { start_date: new Date(next!) },
          session,
        );
      }

      const list = await this.listRepository.findById(
        taskCur?.list,
      );

      if (list?.isShareList) {
        const ids = await this.getRecipientIds(list, DTO.userId, session);
        const taskAfterUpdate = await this.taskRepository.findByIdPopulate(taskId,session);
        this.publisher.pub("Task.exchange", "Task.update.status", "direct", {
          userIds: ids,
          data: {
            task: {
              ...taskAfterUpdate,
              rule:{
                ...taskAfterUpdate?.rule,
              },

            },
            record: Object.fromEntries(
              pairs.map((value) => [
                value.taskId,
                {
                  date: value.date,
                  rule: value.ruleId,
                  status: data.status,
                },
              ]),
            ),
            type: "recurring",
          },
          event: "task-update-status",
        });
      }

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
  }
}
