import {
  IUsecase,
  ITaskRepository,
  ISectionRepository,
  AppError,
} from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";

interface MoveToSectionDTO {
  taskId: string;
  listId: string;
  sectionId?: string; 
}

export class MoveToSectionUsecase implements IUsecase<void> {
  constructor(
    private readonly TaskRepository: ITaskRepository,
    private readonly SectionRepository: ISectionRepository,
    private readonly unitWork: IUnitWork,
  ) { }

  async run(DTO: MoveToSectionDTO, session?: unknown): Promise<void> {
    const { taskId, listId, sectionId } = DTO;

    if (!taskId || !listId) {
      throw new AppError("NOT_FOUND", "Thiếu taskId hoặc listId", 404);
    }

    const taskCur = await this.TaskRepository.findById(taskId, session);
    if (!taskCur) {
      throw new AppError("NOT_FOUND", "Không tìm thấy task để di chuyển", 404);
    }


    const currentSection = await this.SectionRepository.findByTaskId(taskId, session);

    let targetSectionId = sectionId;
    let sectionPath = ""
    if (targetSectionId) {
      const section = await this.SectionRepository.findById(targetSectionId, session);
      sectionPath = section?.path??""
      if (section?.list.toString() !== listId) {
        targetSectionId = undefined;
        sectionPath=""
      }
      
    }

    if (!targetSectionId) {
      const sections = await this.SectionRepository.findMany({
        filter: {
          list: listId
        },
        session: session
      });
      if (!sections || sections.length === 0) {
        throw new AppError(
          "NOT_FOUND",
          "List không có section nào để chuyển task vào",
          404,
        );
      }
      targetSectionId = sections[0].id!.toString();
      sectionPath = sections[0].path!
    }

    

    if (currentSection?.id.toString() === targetSectionId) {
      return;
    }

    try {
      await this.TaskRepository.update(
        taskId,
        {
          section: targetSectionId,
          list: listId,
          path:sectionPath+`/${targetSectionId}`,
        },
        session,
      );
      if (currentSection) {

        await this.SectionRepository.pullTaskFromSection({
          id: currentSection.id.toString(),
          tasks: [taskId],
          session,
        });
      }
      await this.SectionRepository.pushTaskIntoSection({
        id: targetSectionId,
        tasks: [taskId],
        session,
      });

    } catch (error: any) {
      console.error(error);
      if (error instanceof AppError) throw error;
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình di chuyển task sang section khác",
        error.status ?? 500,
      );
    }
  }
  async execute(DTO: MoveToSectionDTO): Promise<void> {
    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      await this.run(DTO, session);
      await this.unitWork.commitTransaction();
    } catch (error: any) {
      console.error(error);
      await this.unitWork.rollBackTransaction();
      if (error instanceof AppError) throw error;
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình di chuyển task sang section khác",
        error.status ?? 500,
      );
    }
  }
}