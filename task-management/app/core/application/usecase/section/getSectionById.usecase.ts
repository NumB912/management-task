import { IUsecase, ISectionRepository, AppError } from "@/app/core/domain";
import { ISectionWithId } from "@/app/core/domain/entities/section.entities";

export class GetSectionByIdUsecase implements IUsecase<ISectionWithId | null> {
  constructor(private readonly repositories: ISectionRepository) {}
  async execute(DTO:{
    sectionId:string,
  }): Promise<ISectionWithId | null> {
    try {
      const {sectionId} = DTO
      const section = await this.repositories.findOne({
        id:sectionId
      });
      return section;
    } catch (error) {
      console.error(error);
      throw new AppError("ERROR", "Lỗi trong quá trình lấy section", 500);
    }
  }
}
