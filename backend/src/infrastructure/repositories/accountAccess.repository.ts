import { Inject, Injectable } from '@nestjs/common';
import type { IAccountAccessRepository } from '@/domain/repositories/IAccountAccess.repository.js';
import { DatabaseModels } from './database/clientSchema.database.js';
import { TYPES } from '../types/dependency.type.js';

@Injectable()
export class AccountAccessRepository implements IAccountAccessRepository {
  constructor(@Inject(TYPES.DatabaseType) private readonly db: DatabaseModels) {}

  async findAccountAccess(id: string) {
    const account = await this.db.User.findOne({ _id: id, deleted_at: null }).select('blocked').lean();
    return account ? { blocked: account.blocked ?? false } : null;
  }
}
