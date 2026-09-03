import { IUsecase, IList, AppError, IFilterRepository } from "@/app/core/domain";

export class DeleteFilterUsecase implements IUsecase<boolean> {
  constructor(private readonly filterRepository: IFilterRepository) {}

  async execute(id: string): Promise<boolean> {
    try {
      const filter = await this.filterRepository.delete(id);
      return true;
    } catch (error) {
      console.error(error);
      throw new AppError("ERROR", "Lỗi trong quá trình xóa filter", 500);
    }
  }
}
