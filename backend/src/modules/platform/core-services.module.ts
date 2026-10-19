import { Module } from '@nestjs/common';

import { coreProviders } from './core.providers.js';

@Module({
  imports: [],
  providers: [...coreProviders],
  exports: coreProviders.map((provider) => provider.provide),
})
export class CoreServicesModule {}
