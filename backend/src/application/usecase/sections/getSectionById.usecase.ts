import { IUsecase, ISectionRepository, AppError } from "@/domain";
import { ISectionWithId } from "@/domain/entities/section.entity";

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
      throw new AppError("ERROR", "Lá»—i trong quÃ¡ trÃ¬nh láº¥y section", 500);
    }
  }
}
