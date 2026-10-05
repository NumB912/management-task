import { AppError, INotification, IUsecase } from "@/domain";
import { INotificationRepository } from "@/domain/repositories/INotification.repository";

export class GetNotificationsUsecase implements IUsecase<
  Partial<INotification>[]
> {
  constructor(private readonly repo: INotificationRepository) {}

  async execute(userId: string): Promise<Partial<INotification>[]> {
    try {
      if (!userId) {
        throw new AppError("NOT_FOUND", "LÃ´Ìƒi khÃ´ng tiÌ€m thÃ¢Ìy ngÆ°Æ¡Ì€i duÌ€ng", 404);
      }
      const data = await this.repo.findMany({
        filter: {
          user: userId,
        },
      });

      return data;
    } catch (error) {
      console.error(error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("ERROR", "Lá»—i trong quÃ¡ trÃ¬nh thá»±c thi", 500);
    }
  }
}
