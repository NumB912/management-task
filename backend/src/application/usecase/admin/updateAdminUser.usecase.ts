import { AppError } from '@/domain/errors/appError.errors.js';
import type {
  AdminUserUpdate,
  IAdminRepository,
} from '@/domain/repositories/IAdmin.repository.js';

export class UpdateAdminUserUsecase {
  constructor(
    private readonly repository: Pick<IAdminRepository, 'updateUser'>,
  ) {}

  async execute(actorId: string, id: string, input: unknown) {
    if (!/^[a-f\d]{24}$/i.test(id))
      throw new AppError('BAD_REQUEST', 'ID người dùng không hợp lệ', 400);
    if (!input || typeof input !== 'object' || Array.isArray(input))
      throw new AppError('BAD_REQUEST', 'Dữ liệu không hợp lệ', 400);
    const body = input as Record<string, unknown>;
    if (
      !Object.keys(body).length ||
      Object.keys(body).some(
        (key) => !['name', 'role', 'blocked'].includes(key),
      )
    ) {
      throw new AppError('BAD_REQUEST', 'Trường cập nhật không hợp lệ', 400);
    }
    const update: AdminUserUpdate = {};
    if (body.name !== undefined) {
      if (
        typeof body.name !== 'string' ||
        !body.name.trim() ||
        body.name.trim().length > 100
      )
      throw new AppError('BAD_REQUEST', 'Tên phải từ 1 đến 100 ký tự', 400);
      update.name = body.name.trim();
    }
    if (body.role !== undefined) {
      if (body.role !== 'admin' && body.role !== 'user')
        throw new AppError('BAD_REQUEST', 'Quyền không hợp lệ', 400);
      update.role = body.role;
    }

    if (body.blocked !== undefined) {
      if (typeof body.blocked !== 'boolean')
        throw new AppError('BAD_REQUEST', 'Trạng thái không hợp lệ', 400);
      update.blocked = body.blocked;
    }
    const excludeAdmins = update.role === 'user' || update.blocked === true;
    if (actorId.toLowerCase() === id.toLowerCase() && excludeAdmins)
      throw new AppError(
        'BAD_REQUEST',
        'Không thể tự khóa hoặc hạ quyền tài khoản của bạn',
        400,
      );
    const user = await this.repository.updateUser(id, update, {
      excludeAdmins,
    });
    if (!user)
      throw new AppError(
        'BAD_REQUEST',
        'Không tìm thấy tài khoản hoặc không thể khóa/hạ quyền admin',
        400,
      );
    return user;
  }
}
