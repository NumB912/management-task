import { Module } from '@nestjs/common';

import { databaseProviders } from './database.providers.js';

@Module({
  imports: [],
  providers: [...databaseProviders],
  exports: databaseProviders.map((provider) => provider.provide),
})
export class DatabaseModule {}
