import { IUsecase, AppError, ISectionRepository, ITaskRepository, IRuleRepository, IListRepository } from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { ISectionWithId } from "@/app/core/domain/entities/section.entities";

export class DeleteSectionUsecase implements IUsecase<ISectionWithId | null> {
  constructor(
    private readonly SectionRepository: ISectionRepository,
    private readonly TaskRepository: ITaskRepository,
    private readonly RuleRepository: IRuleRepository,
    private readonly ListRepository: IListRepository,
    private readonly unitWork: IUnitWork,
  ) { }
  async execute(DeleteSectionDTO: {
    section_id: string
  }): Promise<ISectionWithId | null> {
    const { section_id } = DeleteSectionDTO
    if (!section_id) {
      throw new AppError("INVALID_INPUT", "ID không hợp lệ", 400);
    }
    const section = await this.SectionRepository.findById(section_id)

    if (!section) {
      throw new AppError("NOT_FOUND", "Không tìm thấy section", 404);
    }
    const list = await this.ListRepository.findById(section.list)

    if (!list) {
      throw new AppError("NOT_FOUND", "list không tồn tại", 404);
    }

    if (list.sections.length == 1) {
      throw new AppError("CAN_NOT_DELETE", "Không thể xóa section", 404);
    }

    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      const deleteSection = await this.SectionRepository.delete(section_id, session);
      if (!deleteSection) {
        throw new AppError("NOT_FOUND", "lỗi trong quá trình thực thi", 404);
      }
      const pathSection = `${section?.path}/section-${section_id}`
      await this.RuleRepository.deleteByPath(pathSection, session)
      await this.TaskRepository.deleteByPath(pathSection, session)
        await this.ListRepository.pullSectionsOutOfList({
          listId: list.id,
          sectionIds: [section_id],
          session: session
        })

      await this.unitWork.commitTransaction()
      return section;
    } catch (error: any) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình tạo section",
        error.status ?? 500,
      );
    }
  }
}
