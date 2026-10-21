import { IUsecase, AppError, IFilterRepository } from "@/domain";
import { IFilterWithId } from "@/domain/entities/filter.entity";

export class UpdateFilterUsecase implements IUsecase<Partial<
  Omit<IFilterWithId, "id">
> | null> {
  constructor(private readonly filterRepository: IFilterRepository) { }

  async execute(
    updateFilterDTO: {
      id: string,
      data: Partial<Omit<IFilterWithId, "id" | "created_at" | "updated_at" | "user">>,
      user_id: string
    }
  ): Promise<Partial<Omit<IFilterWithId, "id">> | null> {
    const { data, id, user_id } = updateFilterDTO
    if (!id) {
      throw new AppError("NOT_FOUND", `Không tìm thấy dá»¯ liá»‡u`, 404);
    }
    const isExistFilter = await this.filterRepository.findOne({
      id: id,
      user: user_id
    })
    if (!isExistFilter) {
      throw new AppError("NOT_FOUND", `Không tìm thấy filter`, 404);
    }

    if (data.name != undefined) {
      const isSameName = isExistFilter.name === data.name
      if (isSameName) {
        throw new AppError("NOT_FOUND", `trÃ¹ng tÃªn rá»“i`, 404);
      }
    }

    try {
      const filter = await this.filterRepository.update(id, data);
      return filter ?? null;
    } catch (error) {
      console.error(error);
      throw new AppError(
        "ERROR_UPDATE",
        `Lỗi trong quá trình thực thi tag:${error}`,
        500,
      );
    }
  }
}
