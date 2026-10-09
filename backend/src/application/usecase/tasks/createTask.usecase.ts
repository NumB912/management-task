import {
  IUsecase,
  ITaskRepository,
  AppError,
  ITagRepository,
  IListRepository,
  ITaskWithId,
  IPublisher,
} from "@/domain";
import { IUnitWork } from "@/domain/entities/unitwork.entity";
import { CreateRuleUsecase } from "../rule";
import { AddTagsForMemberUsecase } from "../tag";

import { IMemberRepository } from "@/domain/repositories/IMember.repository";
import { ICreateTaskDTO } from "@/domain/DTO/task/task.DTO";
import { pickRandomColor } from "@/domain/type";

interface CreateTaskProp {
  listId: string;
  userId: string;
  data: ICreateTaskDTO;
}

interface TaskCreateEvent {
  userIds: string[];
  data: unknown;
  event: "task-create";
}

export class CreateTaskUsecase implements IUsecase<Partial<ITaskWithId> | null> {
  constructor(
    private readonly TaskRepository: ITaskRepository,
    private readonly TagRepository: ITagRepository,
    private readonly ListRepository: IListRepository,
    private readonly MemberRepository: IMemberRepository,
    private readonly CreateRuleUsecase: CreateRuleUsecase,
    private readonly AddTagsForMemberUsecase: AddTagsForMemberUsecase,
    private readonly publisher: IPublisher,
    private readonly unitWork: IUnitWork,
  ) {}

  async execute(
    createTaskDTO: CreateTaskProp,
  ): Promise<Partial<ITaskWithId> | null> {
    const { data, listId, userId } = createTaskDTO;
    const rule = data.rule;
    let committed = false;
    let createdTask: Partial<ITaskWithId> | null = null;
    let sseEvent: TaskCreateEvent | null = null;

    try {
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();
      const list = await this.getListOrThrow(listId, session);
      const haveTag = await this.TagRepository.isUserHaveTag({
        userId,
        tagNames: rule.tags,
      
      },session);
      const path = `list-${listId}`;
      const task = await this.TaskRepository.create(
        {
          name: data.name,
          path,
          list: listId,
          id: data.id,
          rule:data.rule.id
        },
        session,
      );

      const listTags = (list.shared_tags ?? []).map((tag) => tag.toString());
      const userTags = haveTag.map((tag) => tag.name);
      const tagCreateList = userTags.filter((tag) => !listTags.includes(tag));
      const tagInList = listTags.filter((tag) => userTags.includes(tag));
      const ruleCreate = await this.CreateRuleUsecase.execute({
        taskId: task.id,
        rule: {
          ...rule,
          color: rule.color ?? pickRandomColor(),
          tags: [...tagCreateList, ...tagInList],
          task: task.id,
          path,
          list: listId,
        },
        session,
      });

      if (tagCreateList.length > 0) {
        await this.ListRepository.pushTagsIntoList({
          listId,
          share_tags: tagCreateList.map((tag) => ({
            created_by: userId,
            tag,
          })),
          session,
        });
      }

      createdTask = await this.TaskRepository.update(
        task.id,
        { rule: ruleCreate.rule.id },
        session,
      );

      if (!createdTask) {
        throw new AppError("INTERNAL_SERVER", "Cập nhật task thất bại", 500);
      }

      await this.ListRepository.pushTasksIntoList({
        tasksId:[data.id],
        listId:listId,
        session:session
      })

      if (list.isShareList) {
        await this.AddTagsForMemberUsecase.execute({
          listIds: [list.id],
          newTags: userTags,
          
        },session);

        const members = await this.MemberRepository.findManyByIds(
          list.members,
          session,
        );
const userIds: string[] = members
  .filter((member) => !!member.user && String(member.user) !== String(userId))
  .map((member) => String(member.user));
        if (userIds.length > 0) {
          sseEvent = {
            userIds,
            data: { ...createdTask, ...ruleCreate },
            event: "task-create",
          };
        }
      }

      await this.unitWork.commitTransaction();
      committed = true;
    } catch (error: any) {
      console.error(error);

      if (!committed) {
        try {
          await this.unitWork.rollBackTransaction();
        } catch (rollbackError) {
          console.error("Rollback thất bại:", rollbackError);
        }
      }

      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình tạo task",
        error.status ?? 500,
      );
    }

    // Gửi SSE sau khi commit để không báo cho dữ liệu có thể bị rollback.
    // Lỗi gửi không làm hỏng việc tạo task.
    if (sseEvent) {
      try {
        await this.publisher.pub(
          "Task.exchange",
          "Task.create",
          "direct",
          sseEvent,
        );
      } catch (publishError) {
        console.error("Gửi SSE task-create thất bại:", publishError);
      }
    }

    return createdTask;
  }

  private async getListOrThrow(listId: string, session?: unknown) {
    const list = await this.ListRepository.findById(listId, session);

    if (!list) {
      throw new AppError("NOT_FOUND", "Không tìm thấy list", 404);
    }

    return list;
  }
}