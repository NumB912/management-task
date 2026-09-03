import { IUsecase, AppError, ISectionRepository } from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { ISectionWithId } from "@/app/core/domain/entities/section.entities";

export class ChangePositionSectionUsecase implements IUsecase<Partial<ISectionWithId | null>> {
  constructor(
    private readonly sectionRepository: ISectionRepository,
    private readonly unitWork: IUnitWork,
  ) { }

  async execute(
    orderMainId: string,
    orderChangeId: string
  ): Promise<Partial<ISectionWithId | null>> {
    if (!orderMainId || !orderChangeId) {
      throw new AppError("NOT_FOUND", `Không tìm thấy section`, 404);
    }

    const sections = await this.sectionRepository.findManyByIds([
      orderMainId, orderChangeId
    ]);

    const mainSection = sections.find((s) => s.id === orderMainId);
    const changeSection = sections.find((s) => s.id === orderChangeId);
    if (!mainSection || !changeSection) {
      throw new AppError("NOT_FOUND", `Không tìm thấy section`, 404);
    }

    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();

      const changePositive = await this.sectionRepository.update(
        changeSection.id,
        { order: mainSection.order },
        session,
      )
      await this.sectionRepository.update(
        mainSection.id,
        { order: changeSection.order },
        session,
      )
      await this.unitWork.commitTransaction();
      return changePositive;
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