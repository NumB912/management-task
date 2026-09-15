import { AppError, IPromodo, IPromodoRepository, IUsecase } from "@/app/core/domain";


export class GetPromodoUsecase
  implements IUsecase<Partial<IPromodo>[]> {
  constructor(
    private readonly promodoRepository:IPromodoRepository,
  ) { }

  async execute(
    userId:string,
  ): Promise<Partial<IPromodo>[]> {
    try {
      const getPromodo = await this.promodoRepository.getPromodoDetail(userId)
      return getPromodo;
    } catch (error) {
      console.error(error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("ERROR", "Lỗi trong quá trình thực thi", 500);
    }
  }
}