import { IUsecase, ISection, AppError, ISectionRepository } from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { ISectionWithId } from "@/app/core/domain/entities/section.entities";

export class UpdateSectionUsecase implements IUsecase<
  Partial<ISectionWithId | null>
> {
  constructor(
    private readonly sectionRepository: ISectionRepository,
    private readonly unitWork: IUnitWork,
  ) { }
  async execute(
    id: string,
    data: Partial<Omit<ISectionWithId, "id">>,
  ): Promise<Partial<ISectionWithId | null>> {
    if (!id) {
      throw new AppError("NOT_FOUND", `Không tìm thấy section`, 404);
    }
    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      const updateSection = await this.sectionRepository.update(id, data, session);

      await this.unitWork.commitTransaction()
      return updateSection;
    } catch (error: any) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình thực thi section",
        error.status ?? 500,
      );
    }
  }
}
