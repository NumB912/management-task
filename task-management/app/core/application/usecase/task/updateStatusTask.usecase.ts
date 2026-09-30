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
} from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { GenerateId } from "@/app/core/domain/services/generateId.service";

interface IUpdateStatusDTO {
  taskId: string;
  data: PayloadUpdateStatus;
  userId: string;
}

interface PayloadUpdateStatus {
  status: IStatusTask;
  id: string;
  record: Record<string, Date>;
}

export class UpdateStatusUsecase implements IUsecase<Record<
  string,
  string
> | null> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly calcService: ICaculateDeadLine,
    private readonly ruleRepository: IRuleRepository,
    private readonly sectionRepository: ISectionRepository,
    private readonly GenerateIdService: GenerateId,
    private readonly unitWork: IUnitWork,
  ) {}

  private nextAfter(
    rule: IRule,
    from: Date,
  ): { next: Date | null; isEnded: boolean } {
    const until = rule.repeat.until ? new Date(rule.repeat.until) : null;
    if (until) until.setHours(23, 59, 59, 999);
    const next = this.calcService.getModeCaculateDeadLine(rule, from);
    const isEnded = !next || (!!until && next.getTime() > until.getTime());
    return { next: next, isEnded };
  }
  async execute(DTO: IUpdateStatusDTO): Promise<Record<string, string> | null> {
    const { data, taskId } = DTO;
    if (!taskId || !data) {
      throw new AppError("BAD_REQUEST", "Thiếu taskId hoặc dữ liệu", 400);
    }
    const entries = Object.entries(data.record ?? {}).map(([tempId, value]) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        throw new AppError(
          "BAD_REQUEST",
          `Ngày không hợp lệ cho ${tempId}`,
          400,
        );
      }
      return { tempId, date };
    });

    if (entries.length > 50) {
      throw new AppError("BAD_REQUEST", `Tối đa ${50} lần lặp mỗi lần`, 400);
    }

    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
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
      if (!isRecurring && data.status === "pending" && entries?.length === 0) {
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
        await this.unitWork.commitTransaction();
        return { [String(updated.id)]: String(updated.id) };
      }
      const lastest = Math.max(...entries.map((value) => value.date.getTime()));
      const { isEnded, next } = this.nextAfter(rule!, new Date(lastest));
      const { id: _taskId, rule: _rule, ...taskBase } = taskCur as any;
      const { id: _ruleId, ...ruleBase } = rule as any;
      const pairs = entries.map((value) => {
        return {
          taskId: this.GenerateIdService.generate(),
          ruleId: this.GenerateIdService.generate(),
          tempId: value.tempId,
          date: value.date,
        };
      });
      const toCreateRule: IRule[] = pairs.map((value) => {
        return {
          ...ruleBase,
          repeat:{
            mode:"none"
          },
          start_date:value.date,
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
          status:data.status
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

      await this.unitWork.commitTransaction();

      const result: Record<string, string> = {};
      pairs.forEach((it) => (result[it.tempId] = it.taskId));

      return result;
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
