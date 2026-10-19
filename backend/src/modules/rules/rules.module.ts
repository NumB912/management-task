import { Module } from '@nestjs/common';
import { PersistenceModule } from '@/modules/platform/persistence.module.js';
import { rulesProviders } from './rules.providers.js';

@Module({
  imports: [PersistenceModule],
  providers: [...rulesProviders],
  exports: rulesProviders.map((provider) => provider.provide),
})
export class RulesModule {}
