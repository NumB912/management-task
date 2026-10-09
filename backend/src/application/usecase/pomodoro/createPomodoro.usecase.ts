import { AppError, IUnitWork, IUsecase } from "@/domain";
import { IPomodoroWithId } from "@/domain/entities/pomodoro.entity";
import { IPomodoroRepository } from "@/domain/repositories/IPomodoro.repository";



export class CreatePomodoroUsecase
  implements IUsecase<Partial<IPomodoroWithId> | null> {
  constructor(
    private readonly pomodoroRepository:IPomodoroRepository,
    private readonly unitWork: IUnitWork,
  ) { }

  async execute(
    data: Pick<IPomodoroWithId,"name"|"progress"|"start"|"task">,
    userId:string,
  ): Promise<Partial<IPomodoroWithId> | null> {
    try {
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();
    const createpomodoro = this.pomodoroRepository.create({
      ...data,
      user:userId
    },session)
      await this.unitWork.commitTransaction();
      return createpomodoro;
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
