import { Module } from '@nestjs/common';

import { messagingProviders } from './messaging.providers.js';

@Module({
  imports: [],
  providers: [...messagingProviders],
  exports: messagingProviders.map((provider) => provider.provide),
})
export class MessagingModule {}
