import {
  IUsecase,
  AppError,
  IUnitWork,
  IListWithId,
} from "@/domain";
import { InitListUsecase } from "./index";

export class CreateListUsecase
  implements IUsecase<Partial<IListWithId> | null> {
  constructor(
    private readonly initListUsecase: InitListUsecase,
    private readonly unitWork: IUnitWork,
  ) { }

  async execute(
    data: Pick<IListWithId, "name" | "user">,
  ): Promise<Partial<IListWithId> | null> {
    try {
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();
      const initList = await this.initListUsecase.execute({
        data: data,
        session: session
      })
      await this.unitWork.commitTransaction();
      return initList;
    } catch (error) {
      console.error(error);
      await this.unitWork.rollBackTransaction();
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("ERROR", "Lá»—i trong quÃ¡ trÃ¬nh thá»±c thi", 500);
    }
  }
}
