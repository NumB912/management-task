import {
  IUsecase,
  ITaskRepository,
  AppError,
  IRuleRepository,
  IRule,
  ITagRepository,
  IListRepository,
} from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { AddTagsForMemberUsecase } from "../tag";
import { RepeatBuilder } from "@/app/core/domain/services/repeatBuild.service";

export class UpdateRuleUsecase implements IUsecase<void> {
  constructor(
    private readonly TaskRepository: ITaskRepository,
    private readonly RuleRepository: IRuleRepository,
    private readonly TagRepository: ITagRepository,
    private readonly ListRepository: IListRepository,
    private readonly AddMemberTags: AddTagsForMemberUsecase,
    private readonly unitWork: IUnitWork,
  ) {}

  async run(
    taskId: string,
    data: Partial<IRule>,
    userId: string,
    session?: unknown,
  ): Promise<void> {
    if (!taskId || !data)
      throw new AppError("NOT_FOUND", "Không tìm thấy task", 404);

    const taskCur = await this.TaskRepository.findById(taskId, session);
    if (!taskCur?.rule)
      throw new AppError("NOT_FOUND", "Không tìm thấy task để cập nhật", 404);

    if (data.tags) {
      if (data.tags.some((tag) => tag == undefined || tag === "")) {
        throw new AppError("NOT_FOUND", "Không tìm thấy tag để cập nhật", 404);
      }

      const isExists = await this.TagRepository.findTagsByName({
        nameTags: data.tags,
        userId: userId,
      });
      if (!isExists) {
        throw new AppError("NOT_FOUND", "Không tìm thấy tag để cập nhật", 404);
      }
    }

    const listOfTask = await this.ListRepository.findById(taskCur.list, session);
    if (!listOfTask) {
      throw new AppError("NOT_FOUND", "Không tìm thấy danh sách để cập nhật", 404);
    }

    await this.RuleRepository.update(
      taskCur.rule,
      {
        repeat: data.repeat ? RepeatBuilder.build(data.repeat) : undefined,
        tags: data.tags,
        priority: data.priority,
        timer: data.timer,
        end_date: data.end_date,
        start_date: data.start_date,
        updated_at: new Date(),
      },
      session,
    );

    const [tagsOnList, tagShareList] = await Promise.all([
      this.ListRepository.getCurrentTag({
        listId: taskCur.list,
        session: session,
      }),
      this.ListRepository.findById(taskCur.list, session),
    ]);

    if (listOfTask.isShareList) {
      const tagsNotInList = new Set(tagsOnList.tags).difference(
        new Set(tagShareList?.shared_tags.map((tag) => tag.tag)),
      );
      if ([...tagsNotInList].length > 0) {
        await this.AddMemberTags.execute(
          {
            listIds: [taskCur.list],
            newTags: [...tagsNotInList],
            session,
          },
        );
      }
    }

    await this.ListRepository.update(
      taskCur.list,
      {
        shared_tags: tagsOnList.tags.map((tag) => {
          return {
            created_by: userId,
            tag: tag,
          };
        }),
      },
      session,
    );
  }

  async execute(
    taskId: string,
    data: Partial<IRule>,
    userId: string,
  ): Promise<void> {
    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      await this.run(taskId, data, userId, session);
      await this.unitWork.commitTransaction();
    } catch (error: any) {
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