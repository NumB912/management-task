import { AppError, IPomodoroRepository, IUnitWork, IUsecase } from "@/domain";


export class DeletePomodoroUsecase
  implements IUsecase<void> {
  constructor(
    private readonly pomodoroRepository:IPomodoroRepository,
    private readonly unitWork: IUnitWork,
  ) { }

  async execute(
    id:string,
    userId:string,
  ): Promise<void> {
    try {
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();
      await this.pomodoroRepository.deleteBy({
        id:id,
        user:userId
      },session)
      await this.unitWork.commitTransaction();
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
