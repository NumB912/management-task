import { Module } from '@nestjs/common';

import { cacheProviders } from './cache.providers.js';

@Module({
  imports: [],
  providers: [...cacheProviders],
  exports: cacheProviders.map((provider) => provider.provide),
})
export class CacheModule {}
