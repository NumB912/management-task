import {
  IUsecase,
  ITaskRepository,
  AppError,
  ISectionRepository,
  ITagRepository,
  IListRepository,
  ITaskWithId,
} from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { CreateRuleUsecase } from "../rule";
import { AddTagsForMemberUsecase } from "../tag";
import { ICreateTaskDTO } from "@/app/core/DTO/task/task.DTO";
import { pickRandomColor } from "@/app/core/domain/type/filterLogic.type";

interface CreateTaskProp {
  listId: string;
  userId: string;
  data: ICreateTaskDTO;
}

export class CreateTaskUsecase implements IUsecase<string> {
  constructor(
    private readonly TaskRepository: ITaskRepository,
    private readonly SectionRepository: ISectionRepository,
    private readonly TagRepository: ITagRepository,
    private readonly ListRepository: IListRepository,
    private readonly CreateRuleUsecase: CreateRuleUsecase,
    private readonly AddTagsForMemberUsecase: AddTagsForMemberUsecase,
    private readonly unitWork: IUnitWork,
  ) { }

  async execute(createTaskDTO: CreateTaskProp): Promise<string> {
    const { data, listId, userId } = createTaskDTO
    const rule = data.rule
    const list = await this.getListOrThrow(listId)
    const HaveTag = await this.TagRepository.isUserHaveTag({
      userId: userId,
      tagNames: rule.tags
    })
    if (!list.sections[0]) {
      throw new AppError("NOT_FOUND", "Không tìm thấy section", 404)
    }

    const section = await this.getSectionOrThrow(list.sections[0])

    try {
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();
      const path = `${section.path}/section-${section.id}`;
      const task = await this.TaskRepository.create(
        {
          name: data.name,
          section: section.id,
          path: path,
          list: listId,
        },
        session,
      );

      const getTagsInList = await this.ListRepository.findById(listId)
      const listTag = getTagsInList?.shared_tags.map((tag) => tag.tag) ?? []
      const ShareTag = HaveTag.map((tag) => tag.name) ?? []
      const tagNotInList = ShareTag.filter((tag) => listTag?.every((tagList) => tagList !== tag)) ?? []
      const TagInlist = listTag.filter((tagList) => ShareTag.includes(tagList)) ?? []
      let tagCreateList: string[] = []
      if (tagNotInList.length > 0) {
        tagCreateList = tagNotInList
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

      const updatedTask = await this.TaskRepository.update(
        task.id,
        { rule: ruleCreate.rule.id },
        session,
      );

      if (!updatedTask) {
        throw new AppError("INTERNAL_SERVER", "Cập nhật task thất bại", 500);
      }


      if (list.isShareList) {
        await this.AddTagsForMemberUsecase.execute({
          listIds: [list.id],
          newTags: ShareTag,
          session: session
        })
      }

      await this.SectionRepository.pushTaskIntoSection(
        {
          id: section.id,
          tasks: [task.id],
          session,
        }
      );

      await this.unitWork.commitTransaction();
      return task.id
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
    const list = await this.ListRepository.findById(listId)

    if (!list) {
      throw new AppError("NOT_FOUND", "Không tìm thấy list", 404)
    }

    return list
  }
}