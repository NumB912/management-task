import {
  AppError,
  IPublisher,
  IUnitWork,
  IUsecase,
  IUserRepository,
} from '@/domain';

export class DeleteAvatarUsecase implements IUsecase<void> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly Pub: IPublisher,
    private readonly unitwork: IUnitWork,
  ) {}

  async execute(DTO: { userId: string }): Promise<void> {
    const { userId } = DTO;
    let urlAvatar: string | null | undefined;
    try {
      await this.unitwork.startTransaction()
      const session = this.unitwork.getSession();
      const user = await this.userRepository.findById(userId, session);
      if (!user) {
        throw new AppError('NOT_FOUND', 'Người dùng không tồn tại', 404);
      }
      await this.userRepository.update(userId, { avatar: null }, session);
      urlAvatar = user.avatar;
      await this.unitwork.commitTransaction();
    } catch (error) {
      await this.unitwork.rollBackTransaction();
      console.error('[PutAvatarUsecase] error:', error);
      throw error;
    }
    if (urlAvatar) {
      await this.Pub.pub<any>('exchange.file', 'file.remove', 'direct', {
        userId,
        fileName: urlAvatar,
      });
    }
  }
}
