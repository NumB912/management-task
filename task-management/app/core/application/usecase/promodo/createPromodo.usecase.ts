import { AppError, IPromodo, IPromodoRepository, IUnitWork, IUsecase } from "@/app/core/domain";


export class CreatePromodoUsecase
  implements IUsecase<Partial<IPromodo> | null> {
  constructor(
    private readonly promodoRepository:IPromodoRepository,
    private readonly unitWork: IUnitWork,
  ) { }

  async execute(
    data: Pick<IPromodo,"task"|"duration"|"name"|"start"|"progress">,
    userId:string,
  ): Promise<Partial<IPromodo> | null> {
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