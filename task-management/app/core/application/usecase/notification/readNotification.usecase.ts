import { AppError, INotification, IUsecase } from "@/app/core/domain";
import { INotificationRepository } from "@/app/core/domain/repositories/INotification.repository";

export class ReadedNotificationUsecase implements IUsecase<
boolean
> {
  constructor(private readonly repo: INotificationRepository) {}

  async execute(userId: string): Promise<boolean> {
    try {
      if (!userId) {
        throw new AppError("NOT_FOUND", "Lỗi không tìm thấy người dùng", 404);
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
      throw new AppError("ERROR", "Lỗi trong quá trình thực thi", 500);
    }
  }
}
