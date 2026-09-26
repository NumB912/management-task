import { AppError, IPromodo, IPromodoRepository, IPromodoWithId, IUnitWork, IUsecase } from "@/app/core/domain";


export class CreatePromodoUsecase
  implements IUsecase<Partial<IPromodoWithId> | null> {
  constructor(
    private readonly promodoRepository:IPromodoRepository,
    private readonly unitWork: IUnitWork,
  ) { }

  async execute(
    data: Pick<IPromodoWithId,"name"|"progress"|"start"|"task">,
    userId:string,
  ): Promise<Partial<IPromodoWithId> | null> {
    try {
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();
    const createPromodo = this.promodoRepository.create({
      ...data,
      user:userId
    },session)
      await this.unitWork.commitTransaction();
      return createPromodo;
    } catch (error) {
      console.error(error);
      await this.unitWork.rollBackTransaction();
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("ERROR", "Lỗi trong quá trình thực thi", 500);
    }
  }
}