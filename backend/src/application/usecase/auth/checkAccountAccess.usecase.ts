import type { IAccountAccessRepository } from '@/domain/repositories/IAccountAccess.repository.js';

export class CheckAccountAccessUsecase {
  constructor(private readonly repository: IAccountAccessRepository) {}

  async execute(id: unknown): Promise<'active' | 'blocked' | 'missing'> {
    if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) return 'missing';
    const account = await this.repository.findAccountAccess(id);
    if (!account) return 'missing';
    return account.blocked ? 'blocked' : 'active';
  }
}
