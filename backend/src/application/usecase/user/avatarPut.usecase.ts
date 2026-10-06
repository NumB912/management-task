import path from 'node:path';
import {
  AppError,
  IPublisher,
  IUnitWork,
  IUsecase,
  IUserRepository,
} from '@/domain';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface IPutAvatarDTO {
  userId: string;
  file: {
    fieldname: string;
    originalName: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer<ArrayBufferLike>;
    size: number;
  };
}

export class PutAvatarUsecase implements IUsecase<void> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly publisher: IPublisher,
    private readonly unitwork: IUnitWork,
  ) {}

  async execute({ userId, file }: IPutAvatarDTO): Promise<void> {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new AppError('INVALID_FILE', 'Định dạng ảnh không hợp lệ', 400);
    }
    if (file.size > MAX_SIZE) {
      throw new AppError('INVALID_FILE', 'Ảnh quá lớn (tối đa 5MB)', 400);
    }
    const ext = path.extname(file.originalName).toLowerCase();
    const fileName = `avatar-${Date.now()}${ext}`;
    const newAvatar = `/uploads/avatars/${userId}/${fileName}`;
    await this.unitwork.startTransaction();
    try {
      const session = this.unitwork.getSession();
      const user = await this.userRepository.findById(userId, session);

      if (!user) {
        throw new AppError('NOT_FOUND', 'Người dùng không tồn tại', 404);
      }
      await this.userRepository.update(userId, { avatar: newAvatar }, session);
      await this.unitwork.commitTransaction();
    } catch (error) {
      await this.unitwork.rollBackTransaction();
      console.error('[PutAvatarUsecase] error:', error);
      throw error;
    }
    await this.publisher.pub<any>('exchange.file', 'file.upload', 'direct', {
      userId,
      file: {
        buffer: file.buffer.toString('base64'),
        mimeType: file.mimetype,
        originalName: file.originalName,
        fileName,
        size: file.size,
      },
    });
  }
}