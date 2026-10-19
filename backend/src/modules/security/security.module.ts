import { Module } from '@nestjs/common';
import { PersistenceModule } from '@/modules/platform/persistence.module.js';
import { CacheModule } from '@/modules/platform/cache.module.js';
import { DatabaseModule } from '@/modules/platform/database.module.js';
import { securityProviders } from './security.providers.js';
import { AccountAccessRepository } from '@/infrastructure/repositories/accountAccess.repository.js';

@Module({
  imports: [PersistenceModule, CacheModule, DatabaseModule],
  providers: [...securityProviders, AccountAccessRepository],
  exports: securityProviders.map((provider) => provider.provide),
})
export class SecurityModule {}
