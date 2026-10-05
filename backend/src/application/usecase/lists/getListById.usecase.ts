import { IUsecase, IList, IListRepository, AppError } from "@/domain";

export class GetListByIdUsecase implements IUsecase<Partial<IList> | null> {
  constructor(private readonly repositories:IListRepository){}
  async execute(id: string): Promise<Partial<IList> | null> {
    try {
      const list = await this.repositories.findByIdPopulate(id);
      return list;
    } catch (error) {
      console.error(error);
      throw new AppError("ERROR", "Lá»—i trong quÃ¡ trÃ¬nh láº¥y danh sÃ¡ch", 500);
    }
  }
}
