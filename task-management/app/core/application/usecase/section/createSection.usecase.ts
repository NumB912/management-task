import { IUsecase, AppError, ISection, ISectionRepository, IListRepository } from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { ISectionWithId } from "@/app/core/domain/entities/section.entities";
import {

} from "@/app/core/domain/repositories/IRepositories";

export class CreateSectionUsecase implements IUsecase<ISectionWithId | null> {
  constructor(
    private readonly sectionRepository: ISectionRepository,
    private readonly listRepository: IListRepository,
    private readonly unitWork: IUnitWork,
  ) { }

  async execute(
    createSectionDTO: {
      user_id: string,
      list_id: string,
      data: Pick<ISectionWithId, "name">,
    }
  ): Promise<ISectionWithId | null> {

    const { data, list_id, user_id } = createSectionDTO

    try {
      await this.unitWork.startTransaction()
      const session = this.unitWork.getSession();
      const isListExist = await this.listRepository.findOne({
        id: list_id,
        user: user_id
      }, session);

      if (!isListExist) {
        throw new AppError("NOT_FOUND", "Danh sách (List) không tồn tại", 404);
      }
      const createdSection = await this.sectionRepository.create(
        {
          name: data.name,
          list: list_id,
          path: `/list-${list_id}`,
          order: Date.now(),
        },
        session,
      );
      await this.listRepository.pushSectionsIntoList({
        listId: list_id,
        sectionIds: [createdSection.id],
        session: session
      })
      await this.unitWork.commitTransaction();
      return createdSection;
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
