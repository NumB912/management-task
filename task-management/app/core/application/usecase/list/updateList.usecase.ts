import { AppError, IListRepository, IListWithId, IUnitWork, IUsecase } from "@/app/core/domain";


export class UpdateListUsecase implements IUsecase<Partial<
  Omit<IListWithId, "id">
> | null> {
  constructor(
    private readonly repositories: IListRepository,
    private readonly unitWork: IUnitWork,
  ) {}
  async execute(
    id: string,
    name: string,
  ): Promise<Partial<Omit<IListWithId, "id">> | null> {
    try {
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();

      if(!id){
        throw new AppError("NOT_FOUND","Không thấy dữ liệu",404)
      }
      const list = await this.repositories.findById(id,session)
      if(!list){
        throw new AppError("NOT_FOUND","Không thấy list",404)
      }

      const updated = await this.repositories.update(id, { name }, session);
      await this.unitWork.commitTransaction()
      return updated;
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
