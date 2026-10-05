import {
  IUsecase,
  ITaskRepository,
  AppError,
  ISectionRepository,
  ITagRepository,
  IListRepository,
  ITaskWithId,
  IPublisher,
} from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { CreateRuleUsecase } from "../rule";
import { AddTagsForMemberUsecase } from "../tag";
import { ICreateTaskDTO } from "@/app/core/DTO/task/task.DTO";
import { pickRandomColor } from "@/app/core/domain/type/filterLogic.type";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";

interface CreateTaskDTO {
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

  async execute(createTaskDTO: CreateTaskDTO): Promise<Partial<ITaskWithId>> {
    const { data, listId, userId, sectionId } = createTaskDTO;
    const rule = data.rule;
    const list = await this.getListOrThrow(listId);
    try {
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();

      let Createtask: Partial<ITaskWithId> | null = {};

      const HaveTag = await this.TagRepository.isUserHaveTag({
        userId: userId,
        tagNames: rule.tags,
        session,
      });
      if (!list.sections[0]) {
        throw new AppError("NOT_FOUND", "Không tìm thấy section", 404);
      }

      const section = await this.getSectionOrThrow(sectionId);
      const path = `${section.path}/section-${section.id}`;
      const task = await this.TaskRepository.create(
        {
          name: data.name,
          section: section.id,
          path: path,
          list: listId,
          id:data.id
        },
        session,
      );

      const getTagsInList = await this.ListRepository.findById(listId, session);
      const listTag = getTagsInList?.shared_tags.map((tag) => tag.tag) ?? [];
      const ShareTag = HaveTag.map((tag) => tag.name) ?? [];
      const tagNotInList =
        ShareTag.filter((tag) =>
          listTag?.every((tagList) => tagList !== tag),
        ) ?? [];
      const TagInlist =
        listTag.filter((tagList) => ShareTag.includes(tagList)) ?? [];
      let tagCreateList: string[] = [];
      if (tagNotInList.length > 0) {
        tagCreateList = tagNotInList;
      }
      const [ruleCreate] = await Promise.all([
        this.CreateRuleUsecase.execute({
          taskId: task.id,
          rule: {
            ...rule,
            color: rule.color ?? pickRandomColor(),
            tags: [...tagCreateList, ...TagInlist],
            task: task.id,
            path: path,
            list: listId,
          },
          session: session,
        }),
        this.ListRepository.pushTagsIntoList({
          listId: listId,
          share_tags: tagCreateList.map((tag) => {
            return {
              created_by: userId,
              tag: tag,
            };
          }),
          session: session,
        }),
      ]);

      Createtask = await this.TaskRepository.update(
        task.id,
        { rule: ruleCreate.rule.id },
        session,
      );

      if (!Createtask) {
        throw new AppError("INTERNAL_SERVER", "Cập nhật task thất bại", 500);
      }

      if (list.isShareList) {
        await this.AddTagsForMemberUsecase.execute({
          listIds: [list.id],
          newTags: ShareTag,
          session: session,
        });
      }

      await this.SectionRepository.pushTaskIntoSection({
        id: section.id,
        tasks: [task.id],
        session,
      });
      if (list.isShareList) {
        const members = await this.MemberRepository.findManyByIds(
          list.members,
          session,
        );
        const users = members
          .map((member) => member.user)
          .filter((user) => user != userId);
        await this.publisher.pub("Task.exchange", "Task.create", "direct", {
          userIds: users,
          data: {
            ...Createtask,

            ...ruleCreate,
          },
          event: "task-create",
        });
      }
      await this.unitWork.commitTransaction();
      return Createtask;
    } catch (error: any) {
      console.error(error);
      await this.unitWork.rollBackTransaction();
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình tạo task",
        error.status ?? 500,
      );
    }
  }

  private async getSectionOrThrow(sectionId: string) {
    const section = await this.SectionRepository.findById(sectionId);
    if (!section) {
      throw new AppError("NOT_FOUND", "Không tìm thấy section", 404);
    }
    return section;
  }

  private async getListOrThrow(listId: string) {
    const list = await this.ListRepository.findById(listId);

    if (!list) {
      throw new AppError("NOT_FOUND", "Không tìm thấy list", 404);
    }

    return list;
  }
}
