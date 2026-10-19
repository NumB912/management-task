import { Module } from '@nestjs/common';
import { PersistenceModule } from '@/modules/platform/persistence.module.js';
import { MessagingModule } from '@/modules/platform/messaging.module.js';
import { notificationsProviders } from './notifications.providers.js';

@Module({
  imports: [PersistenceModule, MessagingModule],
  providers: [...notificationsProviders],
  exports: notificationsProviders.map((provider) => provider.provide),
})
export class NotificationsModule {}
