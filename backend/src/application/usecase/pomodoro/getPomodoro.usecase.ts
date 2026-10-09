import { AppError, IPomodoroRepository, IUsecase } from "@/domain";
import { Ipomodoro } from "@/domain/entities/pomodoro.entity";


export class GetPomodoroUsecase
  implements IUsecase<Partial<Ipomodoro>[]> {
  constructor(
    private readonly pomodoroRepository:IPomodoroRepository,
  ) { }

  async execute(
    userId:string,
  ): Promise<Partial<Ipomodoro>[]> {
    try {
      const getpomodoro = await this.pomodoroRepository.getpomodoroDetail(userId)

      return getpomodoro;
    } catch (error) {
      console.error(error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("ERROR", "Lá»—i trong quÃ¡ trÃ¬nh thá»±c thi", 500);
    }
  }
}
