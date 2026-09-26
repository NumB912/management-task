import { AppError, INotification, IUsecase } from "@/app/core/domain";
import { INotificationRepository } from "@/app/core/domain/repositories/INotification.repository";

export class GetNotificationsUsecase implements IUsecase<
  Partial<INotification>[]
> {
  constructor(private readonly repo: INotificationRepository) {}

  async execute(userId: string): Promise<Partial<INotification>[]> {
    try {
      if (!userId) {
        throw new AppError("NOT_FOUND", "Lỗi không tìm thấy người dùng", 404);
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
      throw new AppError("ERROR", "Lỗi trong quá trình thực thi", 500);
    }
  }
}
