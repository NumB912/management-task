import { AppError, INotification, IUsecase } from "@/domain";
import { INotificationRepository } from "@/domain/repositories/INotification.repository";

export class ReadedNotificationUsecase implements IUsecase<
boolean
> {
  constructor(private readonly repo: INotificationRepository) {}

  async execute(userId: string): Promise<boolean> {
    try {
      if (!userId) {
        throw new AppError("NOT_FOUND", "LÃ´Ìƒi khÃ´ng tiÌ€m thÃ¢Ìy ngÆ°Æ¡Ì€i duÌ€ng", 404);
      }
      const data = await this.repo.updateBy({
        user:userId,
        is_read:false
      },{
        is_read:true,
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
