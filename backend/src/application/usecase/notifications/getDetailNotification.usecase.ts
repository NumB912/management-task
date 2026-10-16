import { AppError, INotification, IUsecase } from '@/domain';
import { INotificationRepository } from '@/domain/repositories/INotification.repository';

export class GetNotificationDetailUsecase implements IUsecase<
  INotification|null
> {
  constructor(private readonly noitificationRepository: INotificationRepository) {}
  async execute(userId: string,id:string): Promise<INotification|null> {
    try {
      if (!userId) {
        throw new AppError(
          'NOT_FOUND',
          'Không thấy dữ liêu',
          404,
        );
      }
      const data = await this.noitificationRepository.getNotificationDetailByUser({
        id:id,
        userId:userId
      })
      return data;
    } catch (error) {
      console.error(error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('ERROR', 'Lỗi trong quá trình thực thi', 500);
    }
  }
}
