import type { IAdminRepository } from '@/domain/repositories/IAdmin.repository.js';

export class CheckAdminUsecase {
  constructor(private readonly repository: Pick<IAdminRepository, 'isActiveAdmin'>) {}
  execute(userId: unknown): Promise<boolean> {
    if (typeof userId !== 'string' || !userId.trim()) return Promise.resolve(false);
    return this.repository.isActiveAdmin(userId);
  }
}
