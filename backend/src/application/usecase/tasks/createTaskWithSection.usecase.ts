import {
  IUsecase,
  ITaskRepository,
  AppError,
  ISectionRepository,
  ITagRepository,
  IListRepository,
  ITaskWithId,
  IPublisher,
} from '@/domain';
import { IUnitWork } from '@/domain/entities/unitwork.entity';
import { CreateRuleUsecase } from '../rule';
import { AddTagsForMemberUsecase } from '../tag';
import { IMemberRepository } from '@/domain/repositories/IMember.repository';
import { ICreateTaskDTO } from '@/domain/DTO/task/task.DTO';
import { pickRandomColor } from '@/domain/type';

interface CreateTaskWithSectionDTO {
  listId: string;
  userId: string;
  sectionId: string;
  data: ICreateTaskDTO;
}

export class CreateTaskWithSection implements IUsecase<Partial<ITaskWithId>> {
  constructor(
    private readonly TaskRepository: ITaskRepository,
    private readonly SectionRepository: ISectionRepository,
    private readonly TagRepository: ITagRepository,
    private readonly ListRepository: IListRepository,
    private readonly MemberRepository: IMemberRepository,
    private readonly CreateRuleUsecase: CreateRuleUsecase,
    private readonly AddTagsForMemberUsecase: AddTagsForMemberUsecase,
    private readonly publisher: IPublisher,
    private readonly unitWork: IUnitWork,
  ) {}

  async execute(dto: CreateTaskWithSectionDTO): Promise<Partial<ITaskWithId>> {
    const { data, listId, userId, sectionId } = dto;
    let transactionStarted = false;
    let createdTask: Partial<ITaskWithId>;
    let recipientIds: string[] = [];

    try {
      await this.unitWork.startTransaction();
      transactionStarted = true;
      const session = this.unitWork.getSession();
      const list = await this.getListOrThrow(listId, session);
      const section = await this.getSectionOrThrow(sectionId, session);
      if (section.list !== listId || !list.sections.includes(sectionId)) {
        throw new AppError(
          'NOT_FOUND',
          'Không tìm thấy section trong list',
          404,
        );
      }

      const { tags, newTags } = await this.getTaskTags(
        userId,
        data.rule.tags,
        list.shared_tags ?? [],
        session,
      );

      const path = `${section.path}/section-${section.id}`;
      const task = await this.TaskRepository.create(
        {
          id: data.id,
          name: data.name,
          section: section.id,
          path,
          list: listId,
          rule: data.rule.id,
          color: data.color ?? pickRandomColor(),
        },
        session,
      );
      const { rule } = await this.CreateRuleUsecase.execute({
        taskId: task.id,
        rule: { ...data.rule, tags, task: task.id, path, list: listId },
        session,
      });
      if (newTags.length > 0) {
        await this.ListRepository.pushTagsIntoList({
          listId,
          share_tags: newTags,
          session,
        });
      }

      const updatedTask = await this.TaskRepository.update(
        task.id,
        { rule: rule.id },
        session,
      );
      if (!updatedTask) {
        throw new AppError(
          'INTERNAL_SERVER',
          'Tạo thất bại vui lòng thử lại',
          500,
        );
      }
      createdTask = updatedTask;
      await this.SectionRepository.pushTaskIntoSection(
        {
          id: section.id,
          tasks: [task.id],
        },
        session,
      );

      if (list.isShareList) {
        await this.AddTagsForMemberUsecase.execute(
          {
            listIds: [list.id],
            newTags: tags,
          },
          session,
        );
        const members = await this.MemberRepository.findManyByIds(
          list.members,
          session,
        );
        recipientIds = [
          ...new Set(
            members.flatMap(({ user }) =>
              user && user !== userId ? [user] : [],
            ),
          ),
        ];
      }
      await this.unitWork.commitTransaction();
    } catch (error: unknown) {
      if (transactionStarted) {
        try {
          await this.unitWork.rollBackTransaction();
        } catch (rollbackError) {
          console.error(
            '[CreateTaskWithSection] rollback failed',
            rollbackError,
          );
        }
      }
      if (error instanceof AppError) throw error;
      console.error('[CreateTaskWithSection] creation failed', error);
      throw new AppError(
        'INTERNAL_SERVER',
        'Lỗi trong quá trình tạo task',
        500,
      );
    }

    if (recipientIds.length > 0) {
      try {
        await this.publisher.pub('Task.exchange', 'Task.create', 'direct', {
          userIds: recipientIds,
          data: { listId: createdTask.list, ids: [createdTask.id] },
          event: 'task-create',
        });
      } catch (error) {
        console.error('[CreateTaskWithSection] notification failed', error);
      }
    }
    return createdTask;
  }

  private async getTaskTags(
    userId: string,
    requestedTags: string[],
    listTags: string[],
    session: unknown,
  ) {
    const userTags = await this.TagRepository.isUserHaveTag(
      {
        userId,
        tagNames: requestedTags,
      },
      session,
    );

    const tagNames = new Set(userTags.map(({ name }) => name));
    const existingTags = new Set(listTags);
    const newTags = [...tagNames].filter((name) => !existingTags.has(name));
    return {
      tags: [...newTags, ...listTags.filter((name) => tagNames.has(name))],
      newTags,
    };
  }

  private async getSectionOrThrow(sectionId: string, session: unknown) {
    const section = await this.SectionRepository.findById(sectionId, session);
    if (!section)
      throw new AppError('NOT_FOUND', 'Không tìm thấy section', 404);
    return section;
  }

  private async getListOrThrow(listId: string, session: unknown) {
    const list = await this.ListRepository.findById(listId, session);
    if (!list) throw new AppError('NOT_FOUND', 'Không tìm thấy list', 404);
    return list;
  }
}
