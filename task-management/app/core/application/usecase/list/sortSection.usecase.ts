import { AppError, IListRepository, IUnitWork, IUsecase } from "@/app/core/domain";

export class SortSectionUsecase implements IUsecase<boolean> {
  constructor(
    private readonly repositories: IListRepository,
    private readonly unitWork: IUnitWork,
  ) {}

 async execute(
    DTO: { listId: string; startSectionId: string; endSectionId: string }
  ): Promise<boolean> {
    try {
      const { listId, startSectionId, endSectionId } = DTO;
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();

      const list = await this.repositories.findById(listId, session);
      if (!list) {
        throw new AppError("NOT_FOUND", "Không thấy list", 404);
      }

      const sections = list.sections;

      const fromIndex = sections.findIndex((s) => s === startSectionId);
      const toIndex = sections.findIndex((s) => s === endSectionId);
      if (fromIndex === -1 || toIndex === -1) {
        throw new AppError("NOT_FOUND", "Không thấy section cần sắp xếp", 404);
      }

      const reorderedSections = this.moveItem(sections, fromIndex, toIndex);
      const updated = await this.repositories.update(
        listId,
        { sections: reorderedSections },
        session,
      );

      await this.unitWork.commitTransaction();
      return !!updated;
    } catch (error: any) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình sort section",
        error.status ?? 500,
      );
    }
  }

    moveItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return [...array];
  const result = [...array];
  const [item] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, item);
  return result;
}
}