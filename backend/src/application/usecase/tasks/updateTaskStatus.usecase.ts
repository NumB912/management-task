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
  IColorRepository,
} from '@/domain';
import { IUnitWork } from '@/domain/entities/unitwork.entity';
import { IMemberRepository } from '@/domain/repositories/IMember.repository';

interface IUpdateStatusDTO {
  data: PayloadUpdateStatus[];
  userId: string;
}

interface PayloadUpdateStatus {
  status: IStatusTask;
  id: string;
  record?: Record<
    string,
    {
      date: Date;
      rule: string;
    }
  >;
  type: 'single' | 'recurring';
}

interface INotifyPayload {
  taskIds: string[];
  listId: string;
}

export class UpdateStatusUsecase implements IUsecase<void> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly calcService: ICaculateDeadLine,
    private readonly ruleRepository: IRuleRepository,
    private readonly sectionRepository: ISectionRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly listRepository: IListRepository,
    private readonly colorReposiotry: IColorRepository,
    private readonly publisher: IPublisher,
    private readonly unitWork: IUnitWork,
  ) {}

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

  private async publishAfterCommit(
    notify: INotifyPayload,
    userId: string,
  ): Promise<void> {
    try {
      const list = await this.listRepository.findById(notify.listId);
      if (!list?.isShareList) return;

      const members = await this.memberRepository.findManyByIds(
        list.members ?? [],
      );
      const userIds = members
        .map((m) => String(m.user))
        .filter((u) => u !== String(userId));

      this.publisher.pub('Task.exchange', 'Task.update.status', 'direct', {
        userIds,
        data: notify,
        event: 'task-update-status',
      });
    } catch (err) {
      console.error('[UpdateStatus] publish after commit failed', err);
    }
  }

  private async handlRecurring(
    groupRecurring: PayloadUpdateStatus[],
    userId: string,
    session?: unknown,
    taskById = new Map<
      string,
      Awaited<ReturnType<ITaskRepository['findByIdPopulate']>>
    >()
  ):Promise<string[]> {
    if (groupRecurring.length === 0) return [];
    const tasks = [
      ...new Set(groupRecurring.map((item) => taskById.get(item.id))),
    ].filter((task): task is NonNullable<typeof task> => Boolean(task));
    const colors = await this.colorReposiotry.findManyByRefIds(
      {
        type: 'task',
        refIds: tasks.map((task) => task.id),
        user: userId,
      },
      session,
    );
    const colorByTaskId = new Map(
      colors.map((color) => [color.refId, color.color]),
    );

    const tasksToCreate: ITaskWithId[] = [];
    const rulesToCreate: IRule[] = [];
    const taskUpdates: { id: string; data: Partial<ITaskWithId> }[] = [];
    const ruleUpdates: { id: string; data: Partial<IRule> }[] = [];
    const taskIdsBySection = new Map<string, string[]>();
    const completedAt = new Date();

    for (const data of groupRecurring) {
      const entries = Object.entries(data.record ?? {}).map(
        ([tempId, value]) => {
          const date = new Date(value.date);
          if (Number.isNaN(date.getTime())) {
            throw new AppError(
              'BAD_REQUEST',
              `Ngày không hợp lệ cho ${tempId}`,
              400,
            );
          }
          return { tempId, ruleId: value.rule, date };
        },
      );
      if (entries.length > 50) {
        throw new AppError('ERROR', 'Tối đa 50 lần lặp mỗi task', 402);
      }
      if (entries.length === 0) continue;

      const taskCur = taskById.get(data.id);
      if (!taskCur?.rule) continue;

      const rule = taskCur.rule;
      const latest = Math.max(...entries.map((entry) => entry.date.getTime()));
      const { isEnded, next } = this.nextAfter(rule, new Date(latest));
      const { id: _taskId, rule: _rule, ...taskBase } = taskCur as any;
      const { id: _ruleId, ...ruleBase } = rule as any;
      const untilEnd = this.getUntilEnd(rule);
      const pairs = entries.filter(
        (entry) => !untilEnd || entry.date <= untilEnd,
      );

      for (const pair of pairs) {
        rulesToCreate.push({
          ...ruleBase,
          repeat: { mode: 'none' },
          start_date: pair.date,
          id: pair.ruleId,
          task: pair.tempId,
        });
        tasksToCreate.push({
          ...taskBase,
          id: pair.tempId,
          rule: pair.ruleId,
          done_at: completedAt,
          status: data.status,
          color: colorByTaskId.get(taskCur.id) ?? taskCur.color,
        });
      }

      if (taskCur.section && pairs.length > 0) {
        const sectionId = String(taskCur.section);
        const ids = taskIdsBySection.get(sectionId) ?? [];
        ids.push(...pairs.map((pair) => pair.tempId));
        taskIdsBySection.set(sectionId, ids);
      }

      taskUpdates.push({
        id: data.id,
        data: isEnded
          ? { status: data.status, done_at: completedAt }
          : { status: 'pending', done_at: undefined },
      });
      ruleUpdates.push({
        id: rule.id,
        data: isEnded
          ? {
              repeat: {
                mode: 'none',
                dates: [],
                days: [],
                every: undefined,
                specificDays: [],
              },
            }
          : { start_date: new Date(next!) },
      });
    }

    if (tasksToCreate.length > 0) {
      await this.taskRepository.createMany(tasksToCreate, session);
      await this.ruleRepository.createMany(rulesToCreate, session);
    }
    await this.sectionRepository.pushTasksIntoSections(
      [...taskIdsBySection].map(([id, tasks]) => ({ id, tasks })),
      session,
    );
    await this.taskRepository.updateManyByIds(taskUpdates, session);
    await this.ruleRepository.updateManyByIds(ruleUpdates, session);

    const taskSet = new Set([...tasksToCreate,...taskUpdates])
    
    return [...taskSet].map((task)=>task.id)
  }
  private async handleSingle(
    groupSingle: PayloadUpdateStatus[],
    session?: unknown,
  ): Promise<string[]> {
    if (groupSingle.length === 0) return [];
    const byStatus = new Map<IStatusTask, string[]>();
    for (const { status, id } of groupSingle) {
      const ids = byStatus.get(status);
      if (ids) ids.push(id);
      else byStatus.set(status, [id]);
    }

    for (const [status, ids] of byStatus) {
      await this.taskRepository.updateMany(ids, { status }, session);
    }
    return groupSingle.map((value)=>value.id)
  }
  private async runInTransactionAttempt(
    DTO: IUpdateStatusDTO,
  ): Promise<INotifyPayload> {
    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      const { data, userId } = DTO;
      if (!data) {
        throw new AppError(
          'BAD_REQUEST',
          'Dữ liệu không chứa thành phần cần',
          400,
        );
      }

      const currentTasks = await this.taskRepository.findManyPopulateByIds(
        [...new Set(data.map((item) => item.id))],
        session,
      );
      const taskById = new Map(currentTasks.map((task) => [task.id, task]));
      const listId = currentTasks[0]?.list;
  
      if (!listId || taskById.size==0) {
        throw new AppError('NOT_FOUND', 'Không tìm thấy task để cập nhật', 404);
      }


      
      const groupSingle: PayloadUpdateStatus[] = data?.filter(
        (value) => !value.record && value.type == 'single',
      );
      const groupRecurring: PayloadUpdateStatus[] = data?.filter(
        (value) => !!value.record && value.type == 'recurring',
      );

      const singleIDs = await this.handleSingle(groupSingle, session);
      const recurringIDs = await this.handlRecurring(groupRecurring, userId, session, taskById);
      await this.unitWork.commitTransaction();
      return {
        taskIds: [...singleIDs,...recurringIDs],
        listId,
      };
    } catch (error: any) {
      try {
        await this.unitWork.rollBackTransaction();
      } catch (rollbackError) {
        console.error('[UpdateStatus] rollback failed', rollbackError);
      }
      throw error;
    }
  }

  private isRetryableWriteConflict(error: any): boolean {
    const pending = [error];
    const visited = new Set<any>();

    while (pending.length > 0) {
      const current = pending.pop();
      if (!current || visited.has(current)) continue;
      if (typeof current === 'object') visited.add(current);

      if (
        current.code === 112 ||
        current.code === '112' ||
        current.hasErrorLabel?.('TransientTransactionError') ||
        current.errorLabels?.includes?.('TransientTransactionError') ||
        /write conflict/i.test(String(current.message ?? ''))
      ) {
        return true;
      }

      pending.push(current.cause, current.errorResponse, current.err);
      if (Array.isArray(current.writeErrors)) pending.push(...current.writeErrors);
    }

    return false;
  }

  private async runInTransaction(
    DTO: IUpdateStatusDTO,
  ): Promise<INotifyPayload> {
    const maxAttempts = 3;

    for (let attempt = 1; ; attempt += 1) {
      try {
        return await this.runInTransactionAttempt(DTO);
      } catch (error: any) {
        if (this.isRetryableWriteConflict(error) && attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 40 * attempt));
          continue;
        }

        console.error(error);
        if (error instanceof AppError) throw error;
        throw new AppError(
          error?.code ?? 'INTERNAL_SERVER',
          error?.message ?? 'Lỗi trong quá trình cập nhật task',
          error?.status ?? 500,
        );
      }
    }
  }

  async execute(DTO: IUpdateStatusDTO): Promise<void> {
    const notify = await this.runInTransaction(DTO);
    await this.publishAfterCommit(notify, DTO.userId);
  }
}
