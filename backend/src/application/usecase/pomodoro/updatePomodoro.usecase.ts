import { AppError, Ipomodoro, IPomodoroRepository, IPomodoroWithId, IUnitWork, IUsecase } from "@/domain";


export class UpdatePomodoroUsecase
  implements IUsecase<void> {
  constructor(
    private readonly pomodoroRepository:IPomodoroRepository,
    private readonly unitWork: IUnitWork,
  ) { }

  async execute(
    id:string,
    userId:string,
    data:Pick<Ipomodoro,"task">
  ): Promise<void> {
    try {
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();
      await this.pomodoroRepository.updateTaskToPomodoro({
        userId:userId,
        id:id,
        task:data.task?.id
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
