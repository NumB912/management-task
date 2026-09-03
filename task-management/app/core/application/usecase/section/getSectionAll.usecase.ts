import { IUsecase, ISection, AppError, ISectionRepository } from "@/app/core/domain";

export class GetAllSectionUsecase implements IUsecase<
  Partial<ISection>[] | null
> {
  constructor(private readonly repositories: ISectionRepository) { }
  async execute(listId: string,user_id:string): Promise<Partial<ISection>[] | null> {
    try{
      if (!listId) {
        throw new AppError("NOT_FOUND", `Không tìm thấy list`, 404);
      }
      const sections = this.repositories.findSectionByList(listId,user_id);
      return sections;
    }catch(error: any){
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình lấy danh sách section",
        error.status ?? 500,
      );
    }
  }
}
