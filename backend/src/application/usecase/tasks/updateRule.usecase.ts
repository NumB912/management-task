import {
  IUsecase, ITaskRepository, AppError, IRuleRepository, IRule,
  ITagRepository, IListRepository, IPublisher, IListWithId,
} from '@/domain';
import { IUnitWork } from '@/domain/entities/unitwork.entity';
import { AddTagsForMemberUsecase } from '../tag';
import { RepeatBuilder } from '@/domain/services/repeat.service';
import { IMemberRepository } from '@/domain/repositories/IMember.repository';
import { IUpdateRuleDTO, ITagOperationsDTO } from '@/domain/DTO/rule/rule.DTO';

export class UpdateRuleUsecase implements IUsecase<void> {
  constructor(
    private readonly TaskRepository: ITaskRepository,
    private readonly RuleRepository: IRuleRepository,
    private readonly TagRepository: ITagRepository,
    private readonly ListRepository: IListRepository,
    private readonly MemberRepository: IMemberRepository,
    private readonly AddMemberTags: AddTagsForMemberUsecase,
    private readonly publisher: IPublisher,
    private readonly unitWork: IUnitWork,
  ) {}

  async run(taskId: string, data: IUpdateRuleDTO, userId: string, session?: unknown): Promise<void> {
    await this.updateRule(taskId, data, userId, session);
  }

  async execute(taskId: string, data: IUpdateRuleDTO, userId: string): Promise<void> {
    let started = false;
    let recipientIds: string[] = [];
    let savedData: Partial<IRule> = {};
    try {
      await this.unitWork.startTransaction();
      started = true;
      const session = await this.unitWork.getSession();
      const { list, patch } = await this.updateRule(taskId, data, userId, session);
      savedData = patch;


      if (list.isShareList) {
        const members = await this.MemberRepository.findManyByIds(list.members, session);
        recipientIds = [...new Set(members.flatMap(({ user }) =>
          user && user !== userId ? [user] : [],
        ))];
      }

      await this.unitWork.commitTransaction();
    } catch (error: unknown) {
      if (started) {
        try {
          await this.unitWork.rollBackTransaction();
        } catch (rollbackError) {
          console.error('[UpdateRule] rollback failed', rollbackError);
        }
      }
      if (error instanceof AppError) throw error;
      console.error('[UpdateRule] update failed', error);
      throw new AppError('INTERNAL_SERVER', 'Lỗi trong quá trình thực thi rule', 500);
    }

    if (recipientIds.length > 0) {
      try {
        await this.publisher.pub('Rule.exchange', 'Rule.update', 'direct', {
          userIds: recipientIds,
          data: { ...savedData, task: taskId },
          event: 'rule-update',
        });
      } catch (error) {
        console.error('[UpdateRule] notification failed', error);
      }
    }
  }

  private async updateRule(taskId: string, data: IUpdateRuleDTO, userId: string, session?: unknown) {
    if (!taskId || !data) throw new AppError('NOT_FOUND', 'Không thấy dữ liệu', 404);
    const task = await this.TaskRepository.findById(taskId, session);
    if (!task?.rule) throw new AppError('NOT_FOUND', 'Không có dữ liệu để cập nhật', 404);
    const { tags: tagInput, ...ruleData } = data;
    const validTags = tagInput === undefined ? undefined
      : Array.isArray(tagInput)
        ? await this.getExistingTags(tagInput, userId, session)
        : await this.applyTagOperations(task.rule, tagInput, userId, session);
    const listId = data.list ?? task.list;
    const list = await this.ListRepository.findById(listId, session);

    if (!list) throw new AppError('NOT_FOUND', 'Không thấy danh sách', 404);

    const patch: Partial<IRule> = {
      ...ruleData,
      ...(validTags !== undefined ? { tags: validTags } : {}),
      ...(data.repeat ? { repeat: { ...data.repeat, ...RepeatBuilder.build(data.repeat) } } : {}),
      updated_at: new Date(),
    };
    const updated = await this.RuleRepository.update(task.rule, patch, session);
    if (!updated) throw new AppError('NOT_FOUND', 'Không tìm thấy rule để cập nhật', 404);

    if (data.tags !== undefined || listId !== task.list) {
      await this.syncListTags(list, session);
      if (listId !== task.list) {
        const oldList = await this.ListRepository.findById(task.list, session);
        if (oldList) await this.syncListTags(oldList, session);
      }
    }
    return { list, patch };
  }

  private async syncListTags(list: IListWithId, session?: unknown): Promise<void> {
    const { tags } = await this.ListRepository.getCurrentTag({ listId: list.id, session });
    const current = new Map(tags.map((name) => [name.toLocaleLowerCase(), name]));
    const existing = new Map((list.shared_tags ?? []).map((name) => [name.toLocaleLowerCase(), name]));
    const added = [...current].filter(([key]) => !existing.has(key)).map(([, name]) => name);
    const removed = [...existing].filter(([key]) => !current.has(key)).map(([, name]) => name);
    if (added.length > 0) {
      await this.ListRepository.pushTagsIntoList({ listId: list.id, share_tags: added, session });
      if (list.isShareList) await this.AddMemberTags.execute({ listIds: [list.id], newTags: added }, session);
    }
    if (removed.length > 0) {
      await this.ListRepository.pullTagsOutOfList({ listIds: [list.id], nameTags: removed, session });
    }

  }

  private async applyTagOperations(ruleId: string, operations: ITagOperationsDTO, userId: string, session?: unknown): Promise<string[]> {
    if (!operations || typeof operations !== 'object' ||
      Object.keys(operations).some((key) => !['add', 'delete'].includes(key)) ||
      (operations.add !== undefined && !Array.isArray(operations.add)) ||
      (operations.delete !== undefined && !Array.isArray(operations.delete))) {
      throw new AppError('BAD_REQUEST', 'Thao tác tag không hợp lệ', 400);
    }
    const additions = operations.add ?? [];
    const deletions = operations.delete ?? [];
    if ([...additions, ...deletions].some((name) => typeof name !== 'string')) {
      throw new AppError('BAD_REQUEST', 'Thao tác tag không hợp lệ', 400);
    }
    const rule = await this.RuleRepository.findById(ruleId, session);
    if (!rule) throw new AppError('NOT_FOUND', 'Không tìm thấy rule để cập nhật', 404);
    const allowedTags = await this.getExistingTags(additions, userId, session);
    const allowed = new Map(allowedTags.map((name) => [name.toLocaleLowerCase(), name]));
    const removed = new Set(deletions.map((name) => name.toLocaleLowerCase()));
    const result = new Map<string, string>();
    for (const name of rule.tags ?? []) {
      if (removed.has(name.toLocaleLowerCase())) continue;
      result.set(name.toLocaleLowerCase(), name);
    }
    for (const name of additions) {
      const existing = allowed.get(name.toLocaleLowerCase());
      if (existing !== undefined) result.set(existing.toLocaleLowerCase(), existing);
    }

    return [...result.values()];
  }

  private async getExistingTags(tags: string[], userId: string, session?: unknown): Promise<string[]> {
    if (!Array.isArray(tags)) {
      throw new AppError('NOT_FOUND', 'Không tìm thấy tag', 404);
    }
    const requestedTags = tags.filter((tag) => typeof tag === 'string' && tag.trim());
    if (requestedTags.length === 0) return [];
    const ownedTags = await this.TagRepository.findTagsByName({ nameTags: requestedTags, userId }, session);
    const ownedNames = new Map(ownedTags.map(({ name }) => [name.toLocaleLowerCase(), name]));
    return [...new Set(requestedTags.flatMap((tag) => {
      const name = ownedNames.get(tag.toLocaleLowerCase());
      return name === undefined ? [] : [name];
    }))];
  }
}
