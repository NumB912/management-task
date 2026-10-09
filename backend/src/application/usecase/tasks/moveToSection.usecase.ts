import {
  IUsecase,
  ITaskRepository,
  ISectionRepository,
  IListRepository,
  AppError,
} from "@/domain";
import { IUnitWork } from "@/domain/entities/unitwork.entity";

interface MoveToSectionDTO {
  taskId: string;
  listId: string;
  sectionId?: string | null;
}

export class MoveToSectionUsecase implements IUsecase<void> {
  constructor(
    private readonly TaskRepository: ITaskRepository,
    private readonly SectionRepository: ISectionRepository,
    private readonly ListRepository: IListRepository,
    private readonly unitWork: IUnitWork,
  ) {}

  async run(DTO: MoveToSectionDTO, session?: unknown): Promise<void> {
    const { taskId, listId, sectionId } = DTO;

    if (!taskId || !listId) {
      throw new AppError("NOT_FOUND", "Thiếu taskId hoặc listId", 404);
    }

    const task = await this.TaskRepository.findById(taskId, session);
    if (!task) {
      throw new AppError("NOT_FOUND", "Không tìm thấy task để di chuyển", 404);
    }
    const currentSection = await this.SectionRepository.findByTaskId(
      taskId,
      session,
    );
    const currentListId = String(task.list);
    let targetSectionId: string | null = null;
    let targetPath = `list-${listId}`;



    if (sectionId) {
      const section = await this.SectionRepository.findById(sectionId, session);
      if (!section) {
        throw new AppError("NOT_FOUND", "Không tìm thấy section đích", 404);
      }
      if (String(section.list) !== String(listId)) {
        throw new AppError(
          "BAD_REQUEST",
          "Section đích không thuộc list này",
          400,
        );
      }
      targetSectionId = String(sectionId);
      targetPath = `${section.path ?? ""}/${targetSectionId}`;
    }

    console.log(targetSectionId)
    
    if (targetSectionId) {
      if (currentSection && String(currentSection.id) === targetSectionId) {
        return;
      }
    } else if (!currentSection && currentListId === String(listId)) {
      return;
    }

    await this.TaskRepository.update(
      taskId,
      {
        section: targetSectionId,
        list: listId,
        path: targetPath,
      },
      session,
    );
    if (currentSection) {
      await this.SectionRepository.pullTaskFromSection({
        id: String(currentSection.id),
        tasks: [taskId],
      },session);
    } else {
      await this.ListRepository.pullTasksOutOfList({
        taskIds: [taskId],
        listId: currentListId,
        session,
      });
    }
    if (targetSectionId) {
      await this.SectionRepository.pushTaskIntoSection({
        id: targetSectionId,
        tasks: [taskId],
      },session);
    } else {
      console.log("jadlkajsdl")
      await this.ListRepository.pushTasksIntoList({
        tasksId: [taskId],
        listId,
        session,
      });
    }
  }

  async execute(DTO: MoveToSectionDTO): Promise<void> {
    let committed = false;
    try {
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();
      await this.run(DTO, session);
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

      if (error instanceof AppError) throw error;
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình di chuyển task",
        error.status ?? 500,
      );
    }
  }
}